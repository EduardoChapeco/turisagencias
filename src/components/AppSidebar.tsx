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
  FileSignature,
  CreditCard,
  Tent,
  Briefcase,
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
    title: 'Painel',
    items: [
      { title: 'Painel Inicial',      url: '/',             icon: LayoutDashboard },
      { title: 'Mapa de Viajantes',   url: '/radar-global', icon: Globe2 },
      { title: 'Radar do Mercado',    url: '/radar',        icon: Newspaper },
      { title: 'Atendimento',         url: '/tickets',      icon: Activity },
    ],
  },
  {
    title: 'Vendas',
    items: [
      { title: 'Funil de Vendas',     url: '/kanban/sales', icon: KanbanSquare },
      { title: 'Propostas & Cotações',url: '/quotations',   icon: FileText },
      { title: 'Base de Clientes',    url: '/clients',      icon: Users },
      { title: 'Pacotes & Grupos',    url: '/group-trips',  icon: TrendingUp },
    ],
  },
  {
    title: 'Operação',
    items: [
      { title: 'Minhas Tarefas',      url: '/kanban/tasks',     icon: Zap },
      { title: 'Gestão de Embarque',  url: '/kanban/departures',icon: Anchor },
      { title: 'Roteiros Digitais',   url: '/itineraries',      icon: Map },
      { title: 'Experiências',        url: '/experiences',      icon: Tent },
    ],
  },
  {
    title: 'Financeiro & Admin',
    items: [
      { title: 'Gestão de Parcelas',  url: '/finance/payments',     icon: CreditCard },
      { title: 'Transações',          url: '/finance/transactions', icon: CreditCard },
      { title: 'Fornecedores',        url: '/finance/suppliers',    icon: Briefcase },
      { title: 'Contratos',           url: '/legal/contracts',      icon: FileSignature },
      { title: 'Equipe',              url: '/team',                 icon: Users },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      { title: 'Especialistas',       url: '/guides',       icon: Book },
      { title: 'Hotéis e Resorts',    url: '/hotels',          icon: Building2 },
      { title: 'Destinos',            url: '/destinations',    icon: MapPin },
      { title: 'Automações IA',       url: '/automations',          icon: Bot },
      { title: 'Assistente IA',       url: '/ai-chat',              icon: Sparkles },
      { title: 'Integrações',         url: '/integrations',         icon: Plug },
    ],
  },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, organization, roles } = useAuthStore();
  const canViewMasterPanel =
    roles.includes('super_admin') ||
    roles.includes('org_admin');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-vj-border/60 bg-white no-scrollbar">
      <SidebarContent className="no-scrollbar flex flex-col h-full">
        
        {/* Logo alinhado com o header global (60px) */}
        <div className="flex h-[60px] shrink-0 items-center gap-3 px-4 border-b border-vj-border/60">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-vj-bg-dark border border-white/10">
            <Zap className="h-4 w-4 text-vj-green fill-vj-green" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="truncate text-sm font-black text-vj-txt tracking-tight leading-none">
                Turis Agências
              </span>
              <span className="text-[10px] font-medium text-vj-txt3 mt-0.5 truncate">
                {organization?.name || 'Painel de Controle'}
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

          {/* Master Panel Button for admins */}
          {canViewMasterPanel && (
            <div className="mt-8 mb-4 border-t border-vj-border/40 pt-8">
              <SidebarMenuButton 
                asChild 
                className={`h-12 rounded-2xl transition-all duration-300 group/btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-100`}
              >
                <Link to="/analytics" className="flex items-center gap-4 px-4">
                  <Activity className="h-4 w-4 text-indigo-500" />
                  {!collapsed && <span className="font-bold text-xs tracking-tight">Painel Master</span>}
                </Link>
              </SidebarMenuButton>
            </div>
          )}
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
