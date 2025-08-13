import { create } from 'zustand';
import { Message, Session, ChatState } from '../types';

interface ChatActions {
  setCurrentSession: (sessionId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  clearMessages: (sessionId?: string) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  getSessionMessages: (sessionId: string) => Message[];
  replaceSessionID: (oldSessionId: string, newSessionId: string) => void;
}

// 保持原始的简单实现，但优化 getSessionMessages 方法
const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  isConnected: false,

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  
  // 添加消息到当前会话
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  // 更新指定消息的内容
  updateMessage: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    })),
  
  // 清除指定会话的消息，如果没有指定会话则清除当前会话
  clearMessages: (sessionId?: string) => {
    const targetSessionId = sessionId || get().currentSessionId;
    if (!targetSessionId) return;
    
    set((state) => ({
      messages: state.messages.filter(m => m.sessionId !== targetSessionId),
    }));
  },
  
  // 添加会话
  addSession: (session) =>
    set((state) => ({
      sessions: Array.from(new Set([...state.sessions, session])),
    })),
  
  // 删除会话
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
  
  // Replace a session (used when converting placeholder to real session)
  replaceSessionID: (oldSessionId, newSessionid) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === oldSessionId ? { ...session, id: newSessionid } : session
      ),
      messages: state.messages.map((message) =>
        message.sessionId === oldSessionId ? { ...message, sessionId: newSessionid } : message
      ),
    })),
  
  // 更新会话标题
  updateSessionTitle: (sessionId, title) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, title } : session
      ),
    })),
  
  // 设置指定会话的消息列表
  setMessages: (sessionId, messages) => {
    set((state) => {
      // 先移除该会话之前的所有消息
      const filteredMessages = state.messages.filter(m => m.sessionId !== sessionId);
      // 再添加新的消息列表
      return {
        messages: [...filteredMessages, ...messages],
      };
    });
  },
  
  // 获取指定会话的消息列表（优化版本）
  getSessionMessages: (sessionId) => {
    const state = get();
    return state.messages.filter(m => m.sessionId === sessionId);
  },
  
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
}));

export default useChatStore;
