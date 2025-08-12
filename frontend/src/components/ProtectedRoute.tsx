import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode; // 可传入自定义加载UI
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, loadingFallback }) => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const authResult = await isAuthenticated();
        if (isMounted) {
          setAuthState(authResult ? 'authenticated' : 'unauthenticated');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        if (isMounted) setAuthState('unauthenticated');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === 'loading') {
    return <>{loadingFallback || <div>Loading...</div>}</>;
  }

  return authState === 'authenticated'
    ? <>{children}</>
    : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
