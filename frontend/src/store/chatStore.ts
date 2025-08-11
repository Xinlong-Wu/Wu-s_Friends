import { create } from 'zustand';
import { Message, Session, ChatState, User } from '../types';

interface ChatActions {
  setCurrentSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: () => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setUser: (user: User | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
}

const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  isConnected: false,
  user: null,

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  updateMessage: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    })),
  
  clearMessages: () =>
    set((state) => ({
      messages: state.messages.filter(
        (msg) => msg.sessionId !== state.currentSessionId
      ),
    })),
  
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  
  removeSession: (sessionId) =>
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== sessionId);
      const newMessages = state.messages.filter((m) => m.sessionId !== sessionId);
      
      // If we're deleting the current session, switch to another one or null
      let newCurrentSessionId = state.currentSessionId;
      if (state.currentSessionId === sessionId) {
        newCurrentSessionId = newSessions.length > 0 ? newSessions[0].id : null;
      }
      
      return {
        sessions: newSessions,
        messages: newMessages,
        currentSessionId: newCurrentSessionId,
      };
    }),
  
  updateSessionTitle: (sessionId, title) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, title } : session
      ),
    })),
  
  setUser: (user) => set({ user }),
  
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
}));

export default useChatStore;
