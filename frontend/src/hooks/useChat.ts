import { useState, useCallback, useEffect } from 'react';
import type { Message, AIModel } from '../types/chat';
import { api } from '../utils/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId] = useState<string>(() => crypto.randomUUID());
  
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  useEffect(() => {
    api.get<AIModel[]>('/models/')
      .then(({ data }) => {
        setModels(data);
        const defaultModel = data.find((m: AIModel) => m.work_name === 'openai/gpt-oss-20b') || data[0];
        if (defaultModel) setSelectedModel(defaultModel);
      })
      .catch(err => {
        console.error('Failed to fetch models', err);
        if (err.response?.status === 401) {
          // api interceptor will dispatch unathorized event
        }
      });
  }, []);

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
        const { data } = await api.post('/', {
          id: chatId, 
          msg: text.trim(),
          model: selectedModel?.work_name || 'openai/gpt-oss-20b'
        });

        const botMessage: Message = {
          id: crypto.randomUUID(),
          role: 'bot',
          content: data.answer ?? 'Нет ответа.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err: any) {
        console.error('[useChat] fetch error:', err);
        if (err.response?.status === 401) {
          // Handled by api interceptor
          return;
        }
        setError('Данная модель сейчас недоступна, попробуйте позже');
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, isLoading, selectedModel],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    reset,
    models,
    selectedModel,
    setSelectedModel
  };
}
