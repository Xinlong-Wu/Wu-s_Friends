// In-memory storage for users
// In a real application, you would use a database
let users: any[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    password: 'password123' // In a real app, this would be hashed
  }
];

// Current user session (in a real app, you would use JWT or sessions)
let currentUser: any = null;

// Import JWT library
import jwt from 'jsonwebtoken';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// User login
export const loginUser = (email: string, password: string) => {
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    currentUser = userWithoutPassword;
    
    // Generate a real JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return {
      token,
      user: userWithoutPassword
    };
  }
  
  return null;
};

// User registration
export const registerUser = (email: string, password: string, name: string) => {
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return null;
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    name,
    password // In a real app, this would be hashed
  };
  
  users.push(newUser);
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = newUser;
  currentUser = userWithoutPassword;
  
  // Generate a real JWT token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  return {
    token,
    user: userWithoutPassword
  };
};

// Get current user
export const getCurrentUser = () => {
  return currentUser;
};

// User logout
export const logoutUser = () => {
  currentUser = null;
};
