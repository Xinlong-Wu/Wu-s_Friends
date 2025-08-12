import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToAI, streamAIResponse, createSession, getSessions, deleteSession, clearSessionMessages, updateSessionTitle } from '../controllers/chatController';

const router = express.Router();

// Create a new chat session
router.post('/sessions', (req, res) => {
  try {
    const session = createSession();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get all chat sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = getSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Delete a chat session
router.delete('/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteSession(id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Send a message to AI (non-blocking)
router.post('/:sessionId/message', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { role, content, files } = req.body;
    
    // Trigger AI processing in the background
    sendMessageToAI(sessionId, { role, content, files })
    
    // Immediately return 200 OK
    res.status(200).json({ message: 'Message received and processing started' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Stream AI responses using Server-Sent Events
router.get('/:sessionId/message/stream', async (req: Request, res: Response) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Allow CORS for SSE
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { sessionId } = req.params;
    
    // Connect to the SSE stream for this session
    // The actual streaming will be handled by the controller
    await streamAIResponse(sessionId, res);
  } catch (error) {
    console.error('Error streaming message:', error);
    res.status(500).json({ error: 'Failed to stream message' });
  }
});

// Clear session messages
router.delete('/:sessionId/messages', (req, res) => {
  try {
    const { sessionId } = req.params;
    const success = clearSessionMessages(sessionId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

// Update session title
router.put('/sessions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const success = updateSessionTitle(id, title);
    if (success) {
      res.status(200).json({ message: 'Session title updated successfully' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session title' });
  }

  return;
});

export default router;
