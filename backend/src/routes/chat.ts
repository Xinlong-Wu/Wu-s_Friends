import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToAI, createSession, getSessions, deleteSession, clearSessionMessages } from '../controllers/chatController';

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

// Send a message to AI and get response
router.post('/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content, files } = req.body;
    
    // For streaming response, we would use Server-Sent Events
    // Here's a simplified version that waits for the full response
    const response = await sendMessageToAI(sessionId, { role, content, files });
    res.json(response);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
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

export default router;
