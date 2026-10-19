export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  model?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  model_name: string;
  created_at: string;
  updated_at: string;
}

export interface SessionsPage {
  sessions: ChatSession[];
  has_more: boolean;
  before: string | null;
}

export interface MessagesPage {
  messages: Message[];
  has_more: boolean;
  before: string | null;
}

export interface AIModel {
  id: number;
  provider: string;
  work_name: string;
  name: string;
  icon_key: string;
}
