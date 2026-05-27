import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, Shield } from 'lucide-react';

interface AdminMasterLayoutProps {
 children: React.ReactNode;
}

/**
 * Layout exclusivo para o Super Admin (Admin Master).
 * Rotas sob este layout devem usar /admin/* paths.
 * Sessão mais curta, audit logging obrigatório.
 */
export function AdminMasterLayout({ children }: AdminMasterLayoutProps) {
 const { user, roles, isLoading } = useAuthStore();
 const location = useLocation();

 if (isLoading) {
 return (
 <div style={{
 display: 'flex',
 minHeight: '100vh',
 alignItems: 'center',
 justifyContent: 'center',
 background: 'var(--vj-bg-primary)',
 }}>
 <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', color: 'var(--vj-accent)' }} />
 </div>
 );
 }

 if (!user) {
 return <Navigate to="/admin/login" state={{ from: location }} replace />;
 }

 const isSuperAdmin = roles.includes('super_admin');

 if (!isSuperAdmin) {
 return (
 <div style={{
 display: 'flex',
 minHeight: '100vh',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 gap: 16,
 background: 'var(--vj-bg-primary)',
 color: 'var(--vj-text-primary)',
 }}>
 <Shield style={{ width: 48, height: 48, color: 'var(--vj-danger)' }} />
 <h1 style={{ fontSize: 24, fontWeight: 700 }}>Acesso Negado</h1>
 <p style={{ color: 'var(--vj-text-secondary)' }}>
 Esta área é restrita ao Super Administrador.
 </p>
 </div>
 );
 }

 return (
 <div
 id="admin-master-layout"
 style={{
 display: 'flex',
 minHeight: '100vh',
 background: 'var(--vj-bg-primary)',
 fontFamily: 'Inter, sans-serif',
 }}
 >
 {/* Sidebar Admin Master */}
 <aside style={{
 width: 56,
 minWidth: 56,
 background: 'var(--vj-bg-secondary)',
 borderRight: '1px solid var(--vj-border)',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 paddingTop: 16,
 gap: 8,
 }}>
 <Shield style={{ width: 20, height: 20, color: 'var(--vj-danger)', marginBottom: 8 }} />
 </aside>

 {/* Content */}
 <main style={{
 flex: 1,
 overflow: 'auto',
 padding: 0,
 }}>
 {children}
 </main>
 </div>
 );
}
