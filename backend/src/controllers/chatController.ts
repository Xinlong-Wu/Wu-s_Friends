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
    id: "temp_" + uuidv4(),
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

// Get messages for a specific session
export const getSessionMessages = (sessionId: string) => {
  const sessionMessages = messages
    .filter(m => m.sessionId === sessionId)
    .map(m => ({
      id: m.id,
      sessionId: m.sessionId,
      content: m.content,
      role: m.role,
      timestamp: m.timestamp,
      files: m.files || []
    }));
  
  return sessionMessages;
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

// Send a message to AI
export const sendMessageToAI = async (sessionId: string, message: any) => {
  const isTempSession = sessionId.startsWith('temp_');
  // Add user message to storage
  const userMessage = {
    id: uuidv4(),
    sessionId,
    content: message.content,
    role: 'user',
    timestamp: new Date(),
    files: message.files || []
  };
  
  if (!isTempSession) {
    messages.push(userMessage);
  }
  
  // Update session timestamp
  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    sseEventEmitter.emit(`error-${sessionId}`, `Session not found: ${sessionId}`);
    return;
  }
  session.updatedAt = new Date();
  
  // Send to AI service with streaming
  try {
    var firstPart = true;
    const decoder = new TextDecoder('utf-8');
    let textBuffer = ''
    await sendMessageToAliyunAI(userMessage, (chunk) => {
      textBuffer += decoder.decode(chunk, { stream: true });
      if (!textBuffer.endsWith('\n\n')) {
        return;
      }

      let lines = textBuffer.split('\n', 4);
      let data = '';
      for (const line of lines) {
        if (line.startsWith('data:')) {
          data = line.slice(5);
        }
        else if (data) {
          data += line
        }
      }

      // console.log(buffer ? buffer : data);
      let content:any = {};
      try {
        content = JSON.parse(data);
        textBuffer = '';
        decoder.decode();
      } catch (e) {
        return;
      }
      
      if (firstPart && isTempSession) {
        // console.log(content);
        userMessage.sessionId = content.output.session_id;
        messages.push(userMessage);
        session.id = content.output.session_id; // Update session ID
        firstPart = false;
      }
      if (content.output.finish_reason === 'stop') {
        const aiMessage = {
            id: content.request_id,
            sessionId: session.id,
            content: content.output.text,
            role: 'assistant',
            timestamp: new Date(),
            files: []
          };
        messages.push(aiMessage);
      }

      // Emit chunk for SSE streaming
      sseEventEmitter.emit(`stream-${sessionId}`, data);
    }, isTempSession ? "" : sessionId);
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
  const streamListener = (data: string) => {
    sseRes.write(`data: ${ data }\n\n`);
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
