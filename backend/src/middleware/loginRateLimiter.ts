// Simple in-memory rate limiter for login attempts
// In a production environment, you'd want to use Redis or a proper database

interface LoginAttempt {
  count: number;
  lastAttempt: number;
}

// In-memory storage for IP login attempts
const ipAttempts: Record<string, LoginAttempt> = {};

// Maximum login attempts allowed
const MAX_ATTEMPTS = 5;
// Time window in milliseconds (24 hours)
const TIME_WINDOW = 24 * 60 * 60 * 1000;

/**
 * Middleware to check if IP is rate limited
 */
export const loginRateLimiter = (req: any, res: any, next: any) => {
  const clientIP = getClientIP(req);
  
  // Check if IP exists in attempts
  const attempt = ipAttempts[clientIP];
  
  // If IP has attempts and is within time window, check limits
  if (attempt) {
    const now = Date.now();
    // If time window has passed, reset attempts
    if (now - attempt.lastAttempt > TIME_WINDOW) {
      ipAttempts[clientIP] = {
        count: 0,
        lastAttempt: now
      };
    } else {
      // Check if max attempts exceeded
      if (attempt.count >= MAX_ATTEMPTS) {
        return res.status(429).json({
          error: 'Too many login attempts. IP temporarily blocked.'
        });
      }
    }
  }
  
  next();
};

/**
 * Record a failed login attempt
 */
export const recordFailedLogin = (req: any) => {
  const clientIP = getClientIP(req);
  
  if (!ipAttempts[clientIP]) {
    ipAttempts[clientIP] = {
      count: 0,
      lastAttempt: Date.now()
    };
  }
  
  ipAttempts[clientIP].count++;
  ipAttempts[clientIP].lastAttempt = Date.now();
};

/**
 * Record a successful login (reset attempts)
 */
export const recordSuccessfulLogin = (req: any) => {
  const clientIP = getClientIP(req);
  delete ipAttempts[clientIP]; // Reset attempts on successful login
};

/**
 * Helper function to get client IP address
 */
function getClientIP(req: any): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    '127.0.0.1'
  );
}
