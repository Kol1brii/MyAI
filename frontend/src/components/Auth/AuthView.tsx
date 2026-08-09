import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  id: string;
  email: string;
  name: string;
  token_type: string;
}

export const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Введите корректный email");
      return false;
    }
    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return false;
    }
    if (!isLogin && (name.length < 3 || name.length > 15)) {
      setError("Имя должно быть от 3 до 15 символов");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/" : "/register/";
      const payload = isLogin ? { email, password } : { email, name, password };

      const { data } = await api.post<AuthResponse>(endpoint, payload);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      window.dispatchEvent(new Event("auth_success"));
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.detail || err.response?.data?.message;

      if (status === 400 || status === 401) {
        setError("Неверный email или пароль");
      } else if (status === 422) {
        setError(message || "Ошибка валидации данных");
      } else {
        setError("Произошла ошибка при подключении к серверу");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--color-canvas)] p-4 overflow-hidden">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[rgba(98,102,114,0.15)] rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-accent)]/20">
            {isLogin ? <LogIn className="text-white" size={24} /> : <UserPlus className="text-white" size={24} />}
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-heading)] tracking-tight">
            {isLogin ? "С возвращением" : "Создать аккаунт"}
          </h1>
          <p className="text-[var(--color-subtle)] text-sm mt-2 text-center">
            {isLogin
              ? "Введите свои данные для входа в систему"
              : "Заполните форму для регистрации в MyAI"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-subtle)] uppercase tracking-wider ml-1">Имя</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-icon)] group-focus-within:text-[var(--color-accent)] transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Александр"
                  className="w-full bg-[rgba(20,21,26,0.5)] border border-[rgba(98,102,114,0.2)] rounded-xl py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-subtle)] uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-icon)] group-focus-within:text-[var(--color-accent)] transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[rgba(20,21,26,0.5)] border border-[rgba(98,102,114,0.2)] rounded-xl py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-subtle)] uppercase tracking-wider ml-1">Пароль</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-icon)] group-focus-within:text-[var(--color-accent)] transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[rgba(20,21,26,0.5)] border border-[rgba(98,102,114,0.2)] rounded-xl py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[var(--color-accent)]/20"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[rgba(98,102,114,0.1)] pt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[var(--color-subtle)] hover:text-[var(--color-accent)] text-sm font-medium transition-colors"
          >
            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
          </button>
        </div>
      </div>
    </div>
  );
};
