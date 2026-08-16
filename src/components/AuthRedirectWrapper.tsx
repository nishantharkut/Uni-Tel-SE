import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthRedirectWrapperProps {
  children: ReactNode;
}

export default function AuthRedirectWrapper({ children }: AuthRedirectWrapperProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <>{children}</>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
