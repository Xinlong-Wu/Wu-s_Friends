import { v4 as uuidv4 } from 'uuid';
import { sendMessageToAliyunAI } from '../services/aiService';

// In-memory storage for sessions and messages
// In a real application, you would use a database
let sessions: any[] = [];
let messages: any[] = [];

// Create a new chat session
export const createSession = () => {
  const now = new Date();
  const session = {
    id: uuidv4(),
    title: 'New Chat',
    createdAt: now,
    updatedAt: now
  };
  
  sessions.push(session);
  return session;
};

// Get all chat sessions
export const getSessions = () => {
  return sessions;
};

// Delete a chat session
export const deleteSession = (id: string) => {
  const sessionIndex = sessions.findIndex(s => s.id === id);
  if (sessionIndex === -1) return false;
  
  sessions.splice(sessionIndex, 1);
  
  // Also delete all messages for this session
  messages = messages.filter(m => m.sessionId !== id);
  
  return true;
};

// Clear session messages
export const clearSessionMessages = (id: string) => {
  const session = sessions.find(s => s.id === id);
  if (!session) return false;
  
  // Delete all messages for this session
  messages = messages.filter(m => m.sessionId !== id);
  
  return true;
};

// Send a message to AI and get response
export const sendMessageToAI = async (sessionId: string, message: any) => {
  // Add user message to storage
  const userMessage = {
    id: uuidv4(),
    sessionId,
    content: message.content,
    role: 'user',
    timestamp: new Date(),
    files: message.files || []
  };
  
  messages.push(userMessage);
  
  // Update session timestamp
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.updatedAt = new Date();
  }
  
  // Get conversation history for this session
  const sessionMessages = messages
    .filter(m => m.sessionId === sessionId)
    .map(m => ({
      role: m.role,
      content: m.content
    }));
  
  // Send to AI service
  const aiResponse = await sendMessageToAliyunAI(sessionMessages);
  
  // Add AI response to storage
  const aiMessage = {
    id: uuidv4(),
    sessionId,
    content: aiResponse,
    role: 'assistant',
    timestamp: new Date()
  };
  
  messages.push(aiMessage);
  
  return {
    id: aiMessage.id,
    content: aiMessage.content,
    role: 'assistant',
    timestamp: aiMessage.timestamp
  };
};
