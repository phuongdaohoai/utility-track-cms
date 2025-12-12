import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';



type Props = {
  children: React.ReactElement;
  requiredRole?: string; // optional role-based guard
};

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const location = useLocation();

  // Try to get auth state from Redux (expected shape from earlier examples)
  const auth = useAppSelector?.((s: any) => s.auth) as {
    token?: string | null;
    user?: { id?: string; name?: string; role?: string } | null;
    loading?: boolean;
  } | undefined;

  // If Redux hook not available (very unlikely), fallback to localStorage
  const token = auth?.token ?? localStorage.getItem('token');

  // loading state shows a simple spinner / loading UI
  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  // if no token -> redirect to login, preserve current location
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // optional: role-based guard
  if (requiredRole && auth?.user?.role && auth.user.role !== requiredRole) {
    // Redirect to 403 page or home
    return <Navigate to="/" replace />;
  }

  // authorized -> render children
  return children;
}
