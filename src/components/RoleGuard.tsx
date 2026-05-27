import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';
import { AccessDenied } from './AccessDenied';

interface RoleGuardProps {
 allow: AppRole[];
 children: React.ReactNode;
 fallbackPath?: string;
 showUI?: boolean;
}

export function RoleGuard({ allow, children, fallbackPath, showUI = true }: RoleGuardProps) {
 const { roles } = useAuthStore();
 const hasAccess = allow.some((role) => roles.includes(role));

 if (!hasAccess) {
 if (fallbackPath && !showUI) {
 return <Navigate to={fallbackPath} replace />;
 }
 return <AccessDenied />;
 }

 return <>{children}</>;
}
