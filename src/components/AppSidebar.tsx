import React, { useState } from 'react';
import {
  Anchor,
  Building2,
  Cloud,
  FileText,
  Globe2,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plane,
  Users,
  Settings as SettingsIcon,
  Sparkles,
  Book,
  Bell,
  Map,
  FileSignature,
  Bot,
  UserPlus
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications, useMarkNotificationAsRead } from '@/hooks/useNotifications';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

type NavGroup = { title: string; items: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[] };

const navGroups: NavGroup[] = [
  {
    title: 'CRM & Vendas',
    items: [
      { title: 'Início',    url: '/',            icon: LayoutDashboard },
      { title: 'Clientes',  url: '/clients',     icon: Users },
      { title: 'CRM',       url: '/kanban/sales',icon: KanbanSquare },
      { title: 'Cotações',  url: '/quotations',  icon: FileText },
    ],
  },
  {
    title: 'Operacional & Gestão',
    items: [
      { title: 'Gestão da Equipe', url: '/team',              icon: Users },
      { title: 'Tarefas do Dia', url: '/kanban/tasks',      icon: KanbanSquare },
      { title: 'Viagens',        url: '/trips',             icon: Plane },
      { title: 'Roteiros',       url: '/itineraries',       icon: Map },
      { title: 'Embarques',      url: '/kanban/departures', icon: Anchor },
      { title: 'Chamados',       url: '/tickets',           icon: LifeBuoy },
    ],
  },
  {
    title: 'Financeiro V3',
    items: [
      { title: 'Transações',     url: '/finance/transactions', icon: Book },
      { title: 'Fornecedores',   url: '/finance/suppliers',    icon: Building2 },
    ],
  },
  {
    title: 'Automações & Inteligência',
    items: [
      { title: 'Regras de Automação', url: '/automations',   icon: Bot },
      { title: 'Contratos Legais', url: '/legal/contracts', icon: FileSignature },
      { title: 'Hotéis da Rede',   url: '/hotels',          icon: Building2 },
      { title: 'Passeios',         url: '/experiences',     icon: Globe2 },
      { title: 'Guias de Destino', url: '/guides',          icon: Book },
    ],
  },
  {
    title: 'Ajustes & IA',
    items: [
      { title: 'Agente IA',      url: '/ai-chat',   icon: Sparkles },
      { title: 'Configurações',  url: '/settings',  icon: SettingsIcon },
    ],
  },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const { organization, profile } = useAuthStore();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationAsRead();
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = (notifications ?? []).filter((n) => !n.read_at).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
            <Cloud className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="truncate font-heading text-sm font-semibold text-sidebar-foreground">
              {organization?.name || 'Turis Agencias'}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none py-2 pb-24">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title} className="mb-2">
              <SidebarGroupLabel className="text-[10px] uppercase font-bold text-vj-txt3 tracking-wider px-4 mb-2">
                {!collapsed && group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive} 
                          className={`hover:bg-sidebar-accent/50 transition-all font-medium border border-transparent ${isActive ? 'bg-vj-green/10 text-vj-green font-semibold border-vj-green/20' : 'text-vj-txt'}`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-vj-green' : 'text-vj-txt3'}`} />
                            {!collapsed && <span>{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {profile?.first_name?.[0] || '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
          )}
          {/* Notification Bell */}
          <Button
            variant="ghost" size="icon"
            className="h-8 w-8 shrink-0 text-sidebar-foreground relative"
            onClick={() => setShowNotif(v => !v)}
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-sidebar-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        {/* Notification Dropdown */}
        {showNotif && (
          <div className="absolute bottom-14 left-2 right-2 z-50 bg-white rounded-xl border border-vj-border shadow-xl max-h-72 overflow-y-auto">
            <div className="px-4 py-3 border-b border-vj-border flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-vj-txt3">Notificações</p>
              {unreadCount > 0 && (
                <button className="text-[10px] text-vj-green font-semibold" onClick={() => {
                  notifications?.filter((n) => !n.read_at).forEach((n) => markRead.mutate(n.id));
                }}>Marcar todas como lidas</button>
              )}
            </div>
            {!notifications?.length ? (
              <p className="text-xs text-muted-foreground p-4 text-center">Nenhuma notificação.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-vj-border/50 cursor-pointer hover:bg-muted/30 transition-colors ${!n.read_at ? 'bg-vj-green/5' : ''}`}
                  onClick={() => { if (!n.read_at) markRead.mutate(n.id); setShowNotif(false); }}>
                  <p className={`text-xs font-medium ${!n.read_at ? 'text-vj-txt' : 'text-vj-txt3'}`}>{n.title}</p>
                  {n.message && <p className="text-[10px] text-vj-txt3 mt-0.5 truncate">{n.message}</p>}
                  <p className="text-[9px] text-vj-txt3/60 mt-1">{new Date(n.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

