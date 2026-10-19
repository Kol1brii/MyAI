import { useCallback, useEffect, useState } from 'react';
import type { AIModel, ChatSession, Message } from '../types/chat';
import { api, deleteSession, fetchMessages, fetchSessions, isAuthError } from '../utils/api';

const DEFAULT_MODEL = 'openai/gpt-oss-20b';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // pending request flag — blocks duplicated submissions
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  // ── models ────────────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get<AIModel[]>('/models/')
      .then(({ data }) => {
        setModels(data);
        const defaultModel =
          data.find((m: AIModel) => m.work_name === DEFAULT_MODEL) || data[0];
        if (defaultModel) setSelectedModel(defaultModel);
      })
      .catch((err) => {
        console.error('[useChat] failed to fetch models', err);
      });
  }, []);

  // ── sessions history ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async (before?: string) => {
    setIsLoadingSessions(true);
    try {
      const page = await fetchSessions(before);
      setSessions((prev) => {
        if (!before) return page.sessions;
        const known = new Set(prev.map((s) => s.id));
        return [...prev, ...page.sessions.filter((s) => !known.has(s.id))];
      });
      setHasMoreSessions(page.has_more);
    } catch (err) {
      console.error('[useChat] failed to load sessions', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const loadMoreSessions = useCallback(() => {
    if (!hasMoreSessions || isLoadingSessions || sessions.length === 0) return;
    // `before` — timestamp of the oldest rendered session
    void loadSessions(sessions[sessions.length - 1].updated_at);
  }, [hasMoreSessions, isLoadingSessions, loadSessions, sessions]);

  // ── messages of the active chat ───────────────────────────────────────────
  const loadMessages = useCallback(async (chatId: string, before?: string) => {
    setIsLoadingMessages(true);
    try {
      const page = await fetchMessages(chatId, before);
      setMessages((prev) => {
        if (!before) return page.messages;
        const known = new Set(prev.map((m) => m.id));
        return [...page.messages.filter((m) => !known.has(m.id)), ...prev];
      });
      setHasMoreMessages(page.has_more);
    } catch (err) {
      console.error('[useChat] failed to load messages', err);
      setError('Не удалось загрузить историю сообщений.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const loadMoreMessages = useCallback(() => {
    if (!activeChatId || !hasMoreMessages || isLoadingMessages || messages.length === 0) {
      return;
    }
    // `before` — timestamp of the oldest rendered message
    void loadMessages(activeChatId, messages[0].timestamp);
  }, [activeChatId, hasMoreMessages, isLoadingMessages, loadMessages, messages]);

  const selectSession = useCallback(
    (session: ChatSession) => {
      if (session.id === activeChatId) return;
      setActiveChatId(session.id);
      setMessages([]);
      setHasMoreMessages(false);
      setError(null);
      void loadMessages(session.id);
    },
    [activeChatId, loadMessages],
  );

  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessages([]);
    setHasMoreMessages(false);
    setError(null);
  }, []);

  const removeSession = useCallback(
    async (sessionId: string) => {
      try {
        await deleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (sessionId === activeChatId) startNewChat();
      } catch (err) {
        console.error('[useChat] failed to delete session', err);
        setError('Не удалось удалить чат.');
      }
    },
    [activeChatId, startNewChat],
  );

  // ── sending ───────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isLoading) return;

      const model = selectedModel?.work_name || DEFAULT_MODEL;
      const chatId = activeChatId ?? crypto.randomUUID();

      setError(null);
      setActiveChatId(chatId);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
          model,
        },
      ]);
      setIsLoading(true);

      try {
        const { data } = await api.post('/', { id: chatId, msg: content, model });
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.answer ?? 'Нет ответа.',
            timestamp: new Date().toISOString(),
            model,
          },
        ]);
        // the chat may be new — refresh the history list
        void loadSessions();
      } catch (err: any) {
        console.error('[useChat] fetch error:', err);
        if (isAuthError(err)) {
          // сессия недействительна — интерсептор уже обновляет токен или уводит на логин
          return;
        }
        // Показываем реальную причину от бэкенда (502 AI provider error и т.п.),
        // иначе любая ошибка выглядит как "backend не запущен".
        const detail = err.response?.data?.detail;
        setError(
          typeof detail === 'string' && detail
            ? `Не удалось получить ответ: ${detail}`
            : 'Не удалось получить ответ. Убедитесь, что backend запущен на порту 8000.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId, isLoading, loadSessions, selectedModel],
  );

  return {
    messages,
    sessions,
    activeChatId,
    isLoading,
    isLoadingSessions,
    isLoadingMessages,
    hasMoreSessions,
    hasMoreMessages,
    error,
    models,
    selectedModel,
    setSelectedModel,
    sendMessage,
    startNewChat,
    selectSession,
    removeSession,
    loadMoreSessions,
    loadMoreMessages,
  };
}
