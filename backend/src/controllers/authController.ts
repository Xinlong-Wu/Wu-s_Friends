// Import JWT library
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// In-memory storage for users
// In a real application, you would use a database
let users: any[] = [
  {
    id: '1',
    email: process.env.TEST_USER_EMAIL,
    name: process.env.TEST_USER_NAME || "小乌",
    password: bcrypt.hashSync(process.env.TEST_USER_PASSWORD||"", 10)
  }
];

// Current user session (in a real app, you would use JWT or sessions)
let currentUser: any = null;

// User login
export const loginUser = async (email: string, password: string) => {
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
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
  }
  
  return null;
};

// User registration
export const registerUser = async (email: string, password: string, name: string) => {
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return null;
  }
  
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    email,
    name,
    password: hashedPassword
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
