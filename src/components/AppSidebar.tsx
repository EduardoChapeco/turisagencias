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
 ChevronRight,
 Smartphone
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
 title: 'Presença Digital & Canais',
 items: [
  { title: 'TurisYou Hub', url: '/turisyou', icon: Globe2 },
  { title: 'Portal do Viajante', url: '/portal-manager', icon: Shield },
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
 { title: 'Comissões', url: '/app/admin/commissions' },
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
 const isOrgAdmin = roles.includes('org_admin') || roles.includes('super_admin');

 // Filtra os grupos de navegação com base no papel
 const filteredNavGroups = navGroups.map(group => {
 if (group.title === 'Administração' || group.title === 'Sistema') {
 return isOrgAdmin ? group : null;
 }
 return group;
 }).filter(Boolean) as typeof navGroups;

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
 <div className="flex h-[60px] shrink-0 items-center px-4 border-b border-vj-border/60 overflow-hidden">
 <div className="flex items-center gap-3 w-full">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-vj-bg-dark border border-white/10">
 <Zap className="h-4 w-4 text-vj-green fill-vj-green" />
 </div>
 <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
 <span className="truncate text-sm font-black text-vj-txt tracking-tight leading-none">
 Turis Agências
 </span>
 <span className="text-[10px] font-medium text-vj-txt3 mt-0.5 truncate">
 {organization?.name || 'Painel de Controle'}
 </span>
 </div>
 </div>
 </div>

 <div className="min-h-0 flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
 {filteredNavGroups.map((group) => (
 <SidebarGroup key={group.title} className="mb-6 p-0">
 {!collapsed && (
 <SidebarGroupLabel className="text-[9px] font-black uppercase text-vj-txt3 tracking-[0.3em] px-4 mb-3">
 {group.title}
 </SidebarGroupLabel>
 )}
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
 tooltip={item.title}
 isActive={isGroupActive}
 className={`rounded-xl transition-colors duration-200 ${isGroupActive ? 'bg-vj-green/10 text-vj-green font-bold' : 'text-vj-txt2 hover:bg-zinc-100/80 hover:text-vj-txt'}`}
 >
 <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isGroupActive ? 'text-vj-green' : 'text-vj-txt3'}`} />
 <span>{item.title}</span>
 <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-vj-txt3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
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
 className={`h-9 px-3 rounded-lg transition-colors duration-200 text-xs font-semibold ${isSubActive ? 'bg-vj-green/10 text-vj-green' : 'text-vj-txt2 hover:bg-zinc-100/80 hover:text-vj-txt'}`}
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
 tooltip={item.title}
 isActive={isActive} 
 className={`rounded-xl transition-colors duration-200 ${isActive ? 'bg-vj-green/10 text-vj-green font-bold' : 'text-vj-txt2 hover:bg-zinc-100/80 hover:text-vj-txt'}`}
 >
 <Link to={item.url || '#'}>
 <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-vj-green' : 'text-vj-txt3'}`} />
 <span>{item.title}</span>
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
 tooltip="Painel Master SaaS"
 className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-colors rounded-xl font-bold"
 >
 <Link to="/admin/dashboard">
 <Shield className="h-4 w-4 shrink-0 text-zinc-500" />
 <span>Painel Master SaaS</span>
 </Link>
 </SidebarMenuButton>
 </div>
 )}
 </div>
 </SidebarContent>

 <SidebarFooter className="shrink-0 p-4 bg-zinc-50/50 border-t border-vj-border/40 overflow-hidden">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 shrink-0 rounded-full bg-white border border-vj-border flex items-center justify-center text-xs font-black transition-transform hover:scale-105">
 {profile?.first_name?.[0] || '?'}
 </div>
 <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
 <p className="truncate text-xs font-black text-vj-txt leading-none">{profile?.first_name}</p>
 <p className="text-[10px] font-bold text-vj-txt3 uppercase tracking-tighter mt-1 truncate">{organization?.name || 'Pro Plan'}</p>
 </div>
 </div>
 <div className="flex items-center gap-1 mt-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:mt-2">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-vj-txt3 hover:text-vj-txt hover:bg-zinc-200/50 rounded-lg transition-colors group-data-[collapsible=icon]:w-full" onClick={() => navigate('/settings')}>
 <SettingsIcon className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-data-[collapsible=icon]:w-full" onClick={handleLogout}>
 <LogOut className="h-4 w-4" />
 </Button>
 </div>
 </SidebarFooter>
 </Sidebar>
 );
}
