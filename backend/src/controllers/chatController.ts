import { v4 as uuidv4 } from 'uuid';
import { sendMessageToAliyunAI } from '../services/aiService';
import { Response } from 'express';
import { EventEmitter } from 'events';

// In-memory storage for sessions and messages
// In a real application, you would use a database
let sessions: any[] = [];
let messages: any[] = [];

// Event emitter for SSE streaming
const sseEventEmitter = new EventEmitter();
// Set max listeners to avoid memory leaks
sseEventEmitter.setMaxListeners(20);

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

// Update session title
export const updateSessionTitle = (id: string, title: string) => {
  const session = sessions.find(s => s.id === id);
  if (!session) return false;
  
  session.title = title;
  session.updatedAt = new Date();
  
  return true;
};

// Send a message to AI (non-blocking)
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
  if (!session) {
    sseEventEmitter.emit(`error-${sessionId}`, `Session not found: ${sessionId}`);
    return;
  }
  session.updatedAt = new Date();
  
  // Get conversation history for this session
  const sessionMessages = messages
    .filter(m => m.sessionId === sessionId)
    .map(m => ({
      role: m.role,
      content: m.content
    }));
  
  // Send to AI service with streaming
  try {
    await sendMessageToAliyunAI(sessionMessages, (chunk) => {
      // Emit chunk for SSE streaming
      sseEventEmitter.emit(`stream-${sessionId}`, chunk);
    });
  } catch (error) {
    console.error('Error in AI processing:', error);
    // Emit error event
    sseEventEmitter.emit(`stream-${sessionId}`, `data: ${JSON.stringify({ error: 'AI processing failed' })}\n\n`);
  } finally {
    // Emit end event
    sseEventEmitter.emit(`end-${sessionId}`, '');
  }
  
  return;
};

// Stream AI responses using SSE
export const streamAIResponse = async (sessionId: string, sseRes: Response) => {
  // Validate session exists
  const session = sessions.find(s => s.id === sessionId);
  console.log(`Streaming AI response for session ${sessionId}`);
  if (!session) {
    sseRes.write(`data: ${JSON.stringify({ error: 'Session not found' })}\n\n`);
    sseRes.write(`data: ${JSON.stringify({ end: true })}\n\n`);
    sseRes.end();
    return;
  }
  
  // Handle client disconnect
  sseRes.on('close', () => {
    console.log(`SSE connection closed for session ${sessionId}`);
  });
  
  // Listen for streaming data
  const streamListener = (chunk: string) => {
    // 按 \n 解析，遇到data:开头的行，将全部后续内容作为data
    let data = '';
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
      data = line.slice(5).trim();
      }
    }
    if (!data) return;
  
    sseRes.write(`data: ${JSON.stringify(JSON.parse(data))}\n\n`);
  };
  
  // Listen for end event
  const endListener = () => {
    sseRes.write(`data: ${JSON.stringify({ end: true })}\n\n`);
    sseRes.end();
  };
  
  // Listen for errors
  const errorListener = (error: any) => {
    sseRes.write(`data: ${JSON.stringify({ end: true, error: true, msg: error.message || 'Streaming error' })}\n\n`);
    sseRes.end();
  };
  
  // Attach listeners
  sseEventEmitter.on(`stream-${sessionId}`, streamListener);
  sseEventEmitter.on(`end-${sessionId}`, endListener);
  sseEventEmitter.on(`error-${sessionId}`, errorListener);
  
  // Send initial connection message
  // sseRes.write(`data: ${JSON.stringify({ message: 'Connected to stream' })}\n\n`);
  
  // Clean up listeners when connection closes
  sseRes.on('close', () => {
    sseEventEmitter.removeListener(`stream-${sessionId}`, streamListener);
    sseEventEmitter.removeListener(`end-${sessionId}`, endListener);
    sseEventEmitter.removeListener(`error-${sessionId}`, errorListener);
  });
};
