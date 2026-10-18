import axios from "axios";
import type { AxiosError } from "axios";
import type { MessagesPage, SessionsPage } from "../types/chat";

const API_BASE_URL = "/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Признак того, что запрос отклонён из-за токена, а не из-за данных.
 *
 * AuthX отвечает 401, когда токена нет вовсе, и 422 с полем `error_type`,
 * когда токен просрочен или повреждён:
 * `{"message":"Invalid Token","error_type":"JWTDecodeError"}`.
 * Штатные 422 от Pydantic приходят с полем `detail` и сюда не попадают.
 */
export function isAuthError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  if (status === 401) return true;

  const data = error.response?.data;
  return (
    status === 422 &&
    typeof data === "object" &&
    data !== null &&
    "error_type" in data
  );
}

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const request = originalRequest as typeof originalRequest & { _retry?: boolean };
    if (request._retry || !isAuthError(error)) {
      return Promise.reject(error);
    }

    // Пока идёт обновление пары токенов, остальные запросы ждут его результата
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        request.headers.Authorization = `Bearer ${token}`;
        return api(request);
      });
    }

    request._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      handleLogout();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      processQueue(null, data.access_token);
      return api(request);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  // Вызываем кастомное событие для уведомления UI о необходимости показать страницу логина
  window.dispatchEvent(new Event("unauthorized"));
}

/**
 * Проверяет сохранённую сессию перед показом интерфейса.
 * `false` — токенов нет или они признаны недействительными (интерсептор при этом
 * сам пытается обновить пару и очищает хранилище, если обновление не удалось).
 */
export async function verifySession(): Promise<boolean> {
  const hasTokens =
    !!localStorage.getItem("access_token") ||
    !!localStorage.getItem("refresh_token");
  if (!hasTokens) return false;

  try {
    await api.get("/search/sessions", { params: { limit: 1 } });
    return true;
  } catch (err) {
    if (isAuthError(err)) return false;
    // бэкенд недоступен — это не повод считать сессию недействительной
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat history API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * History of the current user's chat sessions.
 * `before` — ISO timestamp of the oldest session already rendered (pagination).
 */
export async function fetchSessions(before?: string): Promise<SessionsPage> {
  const { data } = await api.get<SessionsPage>("/search/sessions", {
    params: before ? { before } : undefined,
  });
  return data;
}

export async function deleteSession(chatId: string): Promise<void> {
  await api.delete(`/search/${chatId}`);
}

/**
 * Messages of a chat session.
 * `before` — ISO timestamp of the oldest message already rendered (pagination).
 */
export async function fetchMessages(
  chatId: string,
  before?: string
): Promise<MessagesPage> {
  const { data } = await api.get<MessagesPage>(`/search/${chatId}`, {
    params: before ? { before } : undefined,
  });
  return data;
}
