import React from 'react';
import {
  Anchor,
  Building2,
  FileText,
  Globe2,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Users,
  Settings as SettingsIcon,
  Book,
  Map,
  MapPin,
  Bot,
  Zap,
  TrendingUp,
  Activity,
  Sparkles,
  Plug
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
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
    title: 'Command Center',
    items: [
      { title: 'Painel Inicial',     url: '/',             icon: LayoutDashboard },
      { title: 'Mapa de Viajantes',  url: '/radar-global', icon: Globe2 },
      { title: 'Radar do Mercado',   url: '/radar',        icon: Newspaper },
      { title: 'Atendimento',        url: '/tickets',      icon: Activity },
    ],
  },
  {
    title: 'Engine de Vendas',
    items: [
      { title: 'Funil de Vendas',    url: '/kanban/sales', icon: KanbanSquare },
      { title: 'Propostas IA',       url: '/quotations',   icon: FileText },
      { title: 'Base de Clientes',   url: '/clients',      icon: Users },
      { title: 'Pacotes e Grupos',   url: '/group-trips',  icon: TrendingUp },
    ],
  },
  {
    title: 'Execução & Logs',
    items: [
      { title: 'Minhas Tarefas',     url: '/kanban/tasks',     icon: Zap },
      { title: 'Gestão de Embarque', url: '/kanban/departures',icon: Anchor },
      { title: 'Roteiros Digitais',  url: '/itineraries',      icon: Map },
    ],
  },
  {
    title: 'Intelligence Lab',
    items: [
      { title: 'Especialistas',      url: '/guides',       icon: Book },
      { title: 'Hotéis e Resorts',   url: '/hotels',          icon: Building2 },
      { title: 'Destinos VIP',       url: '/destinations',    icon: MapPin },
      { title: 'IA Squads',          url: '/automations',          icon: Bot },
      { title: 'Turis Intel',        url: '/ai-chat',              icon: Sparkles },
      { title: 'Integrações B2B',    url: '/integrations',         icon: Plug },
    ],
  },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, organization } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-vj-border/60 bg-white no-scrollbar">
      <SidebarContent className="no-scrollbar flex flex-col h-full">
        
        {/* ✈️ OMEGA V4 LOGO SECTION - SHADOWLESS */}
        <div className="flex shrink-0 items-center gap-4 px-8 py-10">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-vj-bg-dark border border-white/10 transition-transform hover:rotate-6">
            <Zap className="h-6 w-6 text-vj-green fill-vj-green" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-black text-vj-txt tracking-tighter uppercase leading-none">
                Turis Agências
              </span>
              <span className="text-[10px] font-bold text-vj-green uppercase tracking-[0.2em] mt-1.5">
                Elite Squad
              </span>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-2 px-4 no-scrollbar">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title} className="mb-8 p-0">
              <SidebarGroupLabel className="text-[9px] font-black uppercase text-vj-txt3 tracking-[0.3em] px-4 mb-4">
                {!collapsed && group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {group.items.map((item) => {
                    const isActive = item.url === '/' ? location.pathname === '/' : location.pathname.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive} 
                          className={`h-12 rounded-2xl transition-all duration-300 group/btn ${isActive ? 'bg-vj-green text-white ' : 'text-vj-txt2 hover:bg-zinc-50 hover:text-vj-txt '}`}
                        >
                          <Link to={item.url} className="flex items-center gap-4 px-4">
                            <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-vj-txt3 group-hover/btn:text-vj-green'}`} />
                            {!collapsed && <span className="font-bold text-xs tracking-tight">{item.title}</span>}
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

      <SidebarFooter className="shrink-0 p-6 bg-zinc-50/50 border-t border-vj-border/40">
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-4 overflow-hidden">
              <div className="h-10 w-10 rounded-full bg-white border border-vj-border flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110">
                {profile?.first_name?.[0] || '?'}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-vj-txt leading-none">{profile?.first_name}</p>
                  <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-tighter mt-1">{organization?.name || 'Pro Plan'}</p>
                </div>
              )}
           </div>
           
           {!collapsed && (
             <div className="flex items-center gap-1.5">
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-vj-border/60 transition-all text-vj-txt3 hover:text-vj-txt" onClick={() => navigate('/settings')}>
                 <SettingsIcon className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white border border-transparent hover:border-vj-border/60 transition-all text-red-500 hover:text-red-600" onClick={handleLogout}>
                 <LogOut className="h-4 w-4" />
               </Button>
             </div>
           )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
