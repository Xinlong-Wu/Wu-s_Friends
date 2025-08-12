export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};
