import { useState } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
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

const mainNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clients', icon: Users },
  { title: 'Cotações', url: '/quotations', icon: FileText },
  { title: 'Viagens', url: '/trips', icon: Plane },
  { title: 'Gestor de Embarques', url: '/kanban/departures', icon: Plane },
  { title: 'Kanban Vendas', url: '/kanban/sales', icon: KanbanSquare },
  { title: 'Hotéis', url: '/hotels', icon: Building2 },
  { title: 'Passeios & Serviços', url: '/experiences', icon: Anchor },
  { title: 'Guias de Destino', url: '/guides', icon: Globe2 },
  { title: 'Info Páginas', url: '/info', icon: Book },
  { title: 'Tickets', url: '/tickets', icon: LifeBuoy },
  { title: 'V-Agent (IA)', url: '/ai-chat', icon: Sparkles },
  { title: 'Configurações', url: '/settings', icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const { organization, profile } = useAuthStore();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationAsRead();
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = (notifications ?? []).filter((n: any) => !n.read_at).length;

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
              {organization?.name || 'CloudBlock'}
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent font-medium text-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                  notifications?.filter((n: any) => !n.read_at).forEach((n: any) => markRead.mutate(n.id));
                }}>Marcar todas como lidas</button>
              )}
            </div>
            {!notifications?.length ? (
              <p className="text-xs text-muted-foreground p-4 text-center">Nenhuma notificação.</p>
            ) : (
              notifications.slice(0, 8).map((n: any) => (
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
