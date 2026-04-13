import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const tabs = [
    { id: 'dashboard', path: '/', label: 'Painel' },
    { id: 'kanban', path: '/kanban', label: 'Kanban' },
    { id: 'quotations', path: '/quotations', label: 'Cotações' },
    { id: 'clients', path: '/clients', label: 'Clientes' },
    { id: 'guides', path: '/guides', label: 'Guias' },
    { id: 'hotels', path: '/hotels', label: 'Hotéis' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
      {/* ══ TOPBAR FIXA (PRD 3.1) ══ */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          zIndex: 200,
          background: 'rgba(247,247,245, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Zona 1 — Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} className="animate-pulse" />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--txt)', letterSpacing: '-0.3px' }}>
            {profile?.organizations?.name || 'Viaja'}
          </span>
        </div>

        {/* Zona 2 — Tabs Centrais */}
        <div style={{ display: 'none', background: 'var(--border)', padding: 3, borderRadius: 10, alignItems: 'center' }} className="sm:flex">
          {tabs.map(tab => {
            const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
            return (
              <Link
                key={tab.id}
                to={tab.path}
                style={{
                  padding: '5px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  color: isActive ? 'var(--txt)' : 'var(--txt2)',
                  background: isActive ? 'var(--white)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                  textDecoration: 'none',
                  transition: 'all 150ms ease'
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Zona 3 — Ações do Usúario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                style={{ 
                  height: 28, width: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', background: 'var(--green-bg)', border: '1px solid rgba(26,122,74,.2)', 
                  color: 'var(--green)', fontSize: 11, fontWeight: 700, cursor: 'pointer' 
                }}
              >
                {(profile?.first_name?.[0] || '?').toUpperCase()}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width: 200, borderRadius: 'var(--r)', borderColor: 'var(--border)' }}>
              <DropdownMenuLabel style={{ color: 'var(--txt2)' }}>
                   <div className="font-semibold text-sm" style={{ color: 'var(--txt)' }}>{profile?.first_name || 'Agente'}</div>
                   <div className="text-xs">{profile?.email || ''}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
              <DropdownMenuItem onClick={() => navigate('/settings')} style={{ cursor: 'pointer', fontSize: 13, gap: 8 }}>
                <Settings size={14} /> Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} style={{ color: 'var(--red)', cursor: 'pointer', fontSize: 13, gap: 8 }}>
                <LogOut size={14} /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area — Pad compensando o Topbar fixo */}
      <main style={{ paddingTop: 50, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="gw" style={{ margin: '0 auto', width: '100%', maxWidth: 1200, padding: '24px' }}>
          {children}
        </div>
      </main>
      
      {/* Mobile Nav Tabs fallback se omitir Zona 2 em telas curtas — Não cobrindo total pra manter leve */}
    </div>
  );
}
