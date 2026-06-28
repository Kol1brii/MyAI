export type Role = 'user' | 'bot';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}
