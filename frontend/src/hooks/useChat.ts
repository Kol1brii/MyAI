import { useState, useCallback } from 'react';
import type { Message } from '../types/chat';

const API_URL = 'http://localhost:8000/v1/';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId] = useState<string>(() => crypto.randomUUID());

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setError(null);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: chatId, msg: text.trim() }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          content: data.answer ?? 'Нет ответа.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error('[useChat] fetch error:', err);
        setError('Не удалось получить ответ. Убедитесь, что backend запущен на порту 8000.');
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, isLoading],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, reset };
}
