export const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  // Try to validate the token by fetching user info
  try {
    // Make a request to get current user with the token
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If the request succeeds, the token is valid
    return response.ok;
  } catch (error) {
    // If request fails, token is invalid
    return false;
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};
