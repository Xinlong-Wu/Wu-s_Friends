import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define the type for the decoded JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // If no token in header, check query parameters (for EventSource)
  if (!token) {
    token = req.query.token as string;
  }

  if (!token) {
    next();
    return
    // return res.status(401).json({ 
    //   error: 'Access token required' 
    // });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    
    // Attach user info to request object
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: 'Invalid or expired token' 
    });
  }
  // 确保函数有返回值
  return;
};
