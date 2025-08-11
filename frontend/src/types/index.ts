export interface Message {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: FileInfo[];
}

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;
  isConnected: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
