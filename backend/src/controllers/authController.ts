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

// User login
export const loginUser = (email: string, password: string) => {
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    currentUser = userWithoutPassword;
    
    // In a real app, you would generate a JWT token
    return {
      token: 'mock-jwt-token',
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
  
  // In a real app, you would generate a JWT token
  return {
    token: 'mock-jwt-token',
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
