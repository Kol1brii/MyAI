export type Role = 'user' | 'bot';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  model?: string;
}

export interface AIModel {
  id: number;
  provider: string;
  work_name: string;
  name: string;
  icon_key: string;
}
