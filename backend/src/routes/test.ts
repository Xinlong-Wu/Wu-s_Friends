import express from 'express';

const router = express.Router();

// Test route to verify backend is working
router.get('/', (req, res) => {
  res.json({ 
    message: 'AI Chat Backend is running!',
    timestamp: new Date().toISOString()
  });
});

export default router;
