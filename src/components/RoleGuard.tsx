import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';

interface RoleGuardProps {
  allow: AppRole[];
  children: React.ReactNode;
  fallbackPath?: string;
}

export function RoleGuard({ allow, children, fallbackPath = '/' }: RoleGuardProps) {
  const { roles } = useAuthStore();
  const hasAccess = allow.some((role) => roles.includes(role));

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
