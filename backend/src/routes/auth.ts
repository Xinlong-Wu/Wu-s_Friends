import express from 'express';
import { loginUser, registerUser, getCurrentUser, logoutUser } from '../controllers/authController';
import { loginRateLimiter, recordFailedLogin, recordSuccessfulLogin } from '../middleware/loginRateLimiter';

const router = express.Router();

// User login
router.post('/login', loginRateLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    const result = loginUser(email, password);
    if (result) {
      // Record successful login
      recordSuccessfulLogin(req);
      res.json(result);
    } else {
      // Record failed login attempt
      recordFailedLogin(req);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// User registration
router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = registerUser(email, password, name);
    if (result) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ error: 'Registration failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    // In a real implementation, you would verify the token
    // For now, we'll return a mock user
    const user = getCurrentUser();
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// User logout
router.post('/logout', (req, res) => {
  try {
    logoutUser();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
