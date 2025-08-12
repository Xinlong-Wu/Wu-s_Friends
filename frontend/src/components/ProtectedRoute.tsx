import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticatedResult, setIsAuthenticatedResult] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await isAuthenticated();
        setIsAuthenticatedResult(authResult);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticatedResult(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    // You can return a loading spinner here if desired
    return <div>Loading...</div>;
  }

  return isAuthenticatedResult ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
