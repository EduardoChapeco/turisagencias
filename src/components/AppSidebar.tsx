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
  FileCheck,
  CreditCard,
  Tent,
  Briefcase,
  Plug,
  Shield,
  BarChart2,
  Send,
  ChevronRight
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

type SubItem = { title: string; url: string };

type NavItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: SubItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { title: 'Painel Inicial', url: '/', icon: LayoutDashboard },
      {
        title: 'Radar & CMS',
        icon: Newspaper,
        items: [
          { title: 'Mapa de Viajantes', url: '/radar-global' },
          { title: 'Radar do Mercado', url: '/radar' },
          { title: 'CMS de Notícias', url: '/news-cms' },
        ]
      },
      { title: 'Analytics', url: '/analytics', icon: BarChart2 },
    ]
  },
  {
    title: 'Marketing & Canais',
    items: [
      {
        title: 'Presença Digital',
        icon: Globe2,
        items: [
          { title: 'Site da Agência', url: '/site-builder?type=website' },
          { title: 'Blog de Viagens', url: '/site-builder?type=blog' },
          { title: 'Link na Bio', url: '/site-builder?type=linkbio' },
        ]
      }
    ]
  },
  {
    title: 'CRM & Fluxos',
    items: [
      {
        title: 'Vendas',
        icon: KanbanSquare,
        items: [
          { title: 'Funil de Vendas', url: '/kanban/sales' },
          { title: 'Cotações', url: '/quotations' },
          { title: 'Propostas Comerciais', url: '/proposals' },
          { title: 'Base de Clientes', url: '/clients' },
        ]
      },
      {
        title: 'Operação',
        icon: Zap,
        items: [
          { title: 'Minhas Tarefas', url: '/kanban/tasks' },
          { title: 'Gestão de Embarque', url: '/kanban/departures' },
          { title: 'Roteiros Digitais', url: '/itineraries' },
          { title: 'Experiências', url: '/experiences' },
          { title: 'Atendimento', url: '/tickets' },
          { title: 'Pacotes & Grupos', url: '/group-trips' },
        ]
      }
    ]
  },
  {
    title: 'Administração',
    items: [
      {
        title: 'Financeiro',
        icon: CreditCard,
        items: [
          { title: 'Gestão de Parcelas', url: '/finance/payments' },
          { title: 'Transações', url: '/finance/transactions' },
          { title: 'Fornecedores', url: '/finance/suppliers' },
        ]
      },
      {
        title: 'Jurídico & Voucher',
        icon: FileSignature,
        items: [
          { title: 'Modelos de Contrato', url: '/legal/contracts' },
          { title: 'Contratos Emitidos', url: '/contracts' },
          { title: 'Vouchers & Boarding', url: '/vouchers' },
        ]
      }
    ]
  },
  {
    title: 'Inteligência Artificial',
    items: [
      {
        title: 'IA & Automações',
        icon: Sparkles,
        items: [
          { title: 'Assistente IA', url: '/ai-chat' },
          { title: 'Central de IA', url: '/ai-dashboard' },
          { title: 'Automações IA', url: '/automations' },
        ]
      }
    ]
  },
  {
    title: 'Sistema',
    items: [
      {
        title: 'Configurações',
        icon: SettingsIcon,
        items: [
          { title: 'Especialistas', url: '/settings?tab=guides' },
          { title: 'Hotéis e Resorts', url: '/settings?tab=hotels' },
          { title: 'Destinos', url: '/settings?tab=destinations' },
          { title: 'Integrações', url: '/settings?tab=integrations' },
          { title: 'Equipe', url: '/settings?tab=agents' },
          { title: 'Geral', url: '/settings' },
        ]
      }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, organization, roles } = useAuthStore();
  const canViewMasterPanel = roles.includes('super_admin');

  const checkActive = (url: string) => {
    const [path, query] = url.split('?');
    const pathMatches = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
    if (!pathMatches) return false;
    if (!query) return true;
    
    // Validar parâmetros de busca
    const currentParams = new URLSearchParams(location.search);
    const targetParams = new URLSearchParams(query);
    for (const [key, val] of targetParams.entries()) {
      if (currentParams.get(key) !== val) return false;
    }
    return true;
  };

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

        <div className="min-h-0 flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
          {navGroups.map((group) => (
            <SidebarGroup key={group.title} className="mb-6 p-0">
              <SidebarGroupLabel className="text-[9px] font-black uppercase text-vj-txt3 tracking-[0.3em] px-4 mb-3">
                {!collapsed && group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => {
                    if (item.items) {
                      const isGroupActive = item.items.some(subItem => checkActive(subItem.url));
                      return (
                        <Collapsible key={item.title} asChild defaultOpen={isGroupActive} className="group/collapsible">
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton 
                                isActive={isGroupActive}
                                className={`h-11 rounded-xl transition-all duration-300 group/btn ${isGroupActive ? 'bg-[#EEF4FF] text-vj-green border-l-4 border-vj-green rounded-l-none font-bold' : 'text-vj-txt2 hover:bg-zinc-50 hover:text-vj-txt'}`}
                              >
                                <div className="flex items-center w-full justify-between gap-4 px-4">
                                  <div className="flex items-center gap-4">
                                    <item.icon className={`h-4 w-4 transition-colors ${isGroupActive ? 'text-vj-green' : 'text-vj-txt3 group-hover/btn:text-vj-green'}`} />
                                    {!collapsed && <span className="text-xs font-semibold tracking-tight">{item.title}</span>}
                                  </div>
                                  {!collapsed && <ChevronRight className="h-3 w-3 text-vj-txt3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />}
                                </div>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="mx-0 border-l border-vj-border/60 pl-6 pr-2 gap-1 mt-1">
                                {item.items.map((subItem) => {
                                  const isSubActive = checkActive(subItem.url);
                                  return (
                                    <SidebarMenuSubItem key={subItem.title}>
                                      <SidebarMenuSubButton 
                                        asChild 
                                        isActive={isSubActive}
                                        className={`h-9 px-3 rounded-lg transition-all duration-200 text-xs font-semibold ${isSubActive ? 'bg-[#EEF4FF] text-vj-green border-l-2 border-vj-green rounded-l-none' : 'text-vj-txt2 hover:bg-zinc-50 hover:text-vj-txt'}`}
                                      >
                                        <Link to={subItem.url}>{subItem.title}</Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  );
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    } else {
                      const isActive = checkActive(item.url || '');
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={isActive} 
                            className={`h-11 rounded-xl transition-all duration-300 group/btn ${isActive ? 'bg-[#EEF4FF] text-vj-green border-l-4 border-vj-green rounded-l-none font-bold' : 'text-vj-txt2 hover:bg-zinc-50 hover:text-vj-txt'}`}
                          >
                            <Link to={item.url || '#'} className="flex items-center gap-4 px-4">
                              <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-vj-green' : 'text-vj-txt3 group-hover/btn:text-vj-green'}`} />
                              {!collapsed && <span className="text-xs font-semibold tracking-tight">{item.title}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          {/* Master Panel Button for admins */}
          {canViewMasterPanel && (
            <div className="mt-6 mb-4 border-t border-vj-border/40 pt-6">
              <SidebarMenuButton 
                asChild 
                className={`h-11 rounded-xl transition-all duration-300 group/btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-100`}
              >
                <Link to="/admin/dashboard" className="flex items-center gap-4 px-4">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  {!collapsed && <span className="font-bold text-xs tracking-tight">Painel Master SaaS</span>}
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
