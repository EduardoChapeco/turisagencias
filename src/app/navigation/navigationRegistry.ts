import { 
  LayoutDashboard, Newspaper, Globe2, KanbanSquare, 
  Settings as SettingsIcon, Shield, BarChart2, Briefcase, CreditCard, Plug
} from 'lucide-react';
import React from 'react';

export type NavigationItem = {
  title: string;
  url?: string;
  routeId?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: { title: string; url: string; routeId?: string }[];
  requiredRoles?: string[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
  requiredRoles?: string[];
};

/**
 * Single source of truth for the Application Navigation (AppSidebar)
 */
export const appNavigationGroups: NavigationGroup[] = [
  {
    title: 'Principal',
    items: [
      { title: 'Painel Inicial', url: '/', routeId: 'app_dashboard', icon: LayoutDashboard },
      {
        title: 'Radar & CMS',
        icon: Newspaper,
        items: [
          { title: 'Mapa de Viajantes', url: '/radar-global' },
          { title: 'Radar do Mercado', url: '/radar' },
          { title: 'CMS de Notícias', url: '/news-cms' },
        ]
      },
      { title: 'Analytics', url: '/analytics', routeId: 'data_analytics', icon: BarChart2, requiredRoles: ['org_admin', 'super_admin'] },
    ]
  },
  {
    title: 'Presença Digital & Canais',
    items: [
      { title: 'TurisYou Hub', url: '/turisyou', routeId: 'cms_turisyou', icon: Globe2 },
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
          { title: 'Funil de Vendas', url: '/kanban/sales', routeId: 'crm_sales_kanban' },
          { title: 'Cotações', url: '/quotations', routeId: 'sales_quotations' },
          { title: 'Propostas', url: '/proposals', routeId: 'sales_proposals' },
          { title: 'Clientes', url: '/clients', routeId: 'crm_clients' },
        ]
      },
      {
        title: 'Operacional',
        icon: Briefcase,
        items: [
          { title: 'Quadro de Embarques', url: '/kanban/departures', routeId: 'ops_departures' },
          { title: 'Grupos de Viagem', url: '/group-trips', routeId: 'ops_group_trips' },
          { title: 'Vouchers Emitidos', url: '/vouchers', routeId: 'ops_vouchers' },
          { title: 'Contratos & Assinaturas', url: '/contracts', routeId: 'ops_contracts' },
        ]
      }
    ]
  },
  {
    title: 'Gestão da Agência',
    requiredRoles: ['org_admin', 'super_admin'],
    items: [
      {
        title: 'Financeiro',
        icon: CreditCard,
        items: [
          { title: 'Contas e Transações', url: '/finance/transactions', routeId: 'fin_transactions' },
          { title: 'Pagamentos / Parcelas', url: '/finance/payments', routeId: 'fin_payments' },
          { title: 'Comissões da Equipe', url: '/app/admin/commissions', routeId: 'fin_commissions_admin' },
        ]
      },
      { title: 'Configurações', url: '/settings', icon: SettingsIcon },
      { title: 'Integrações', url: '/settings?tab=integrations', icon: Plug },
    ]
  }
];

/**
 * Filter navigation tree based on user roles
 */
export const getFilteredNavigation = (roles: string[]): NavigationGroup[] => {
  return appNavigationGroups.map(group => {
    // Check group level
    if (group.requiredRoles && !roles.includes('super_admin') && !group.requiredRoles.some(r => roles.includes(r))) {
      return null;
    }
    
    // Check items
    const filteredItems = group.items.map(item => {
      if (item.requiredRoles && !roles.includes('super_admin') && !item.requiredRoles.some(r => roles.includes(r))) {
        return null;
      }
      return item;
    }).filter(Boolean) as NavigationItem[];

    if (filteredItems.length === 0) return null;

    return {
      ...group,
      items: filteredItems
    };
  }).filter(Boolean) as NavigationGroup[];
};
