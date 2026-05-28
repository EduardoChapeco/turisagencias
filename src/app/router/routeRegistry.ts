export type AppRouteLayout = 'app' | 'admin_master' | 'agency_admin' | 'agent' | 'public' | 'client_portal' | 'auth';
export type AppRouteVisibility = 'private' | 'public' | 'token' | 'admin_secret';

export type AppRouteContract = {
  id: string;
  path: string;
  component: string;
  layout: AppRouteLayout;
  visibility: AppRouteVisibility;
  requiredRoles: string[];
  featureFlag?: string;
  params?: string[];
  dataDependencies: string[];
  edgeFunctions?: string[];
  tables?: string[];
  rlsCritical: boolean;
  navGroup?: string;
  breadcrumb?: string[];
};

export const routeRegistry: AppRouteContract[] = [
  // --- AUTH & ONBOARDING ---
  {
    id: 'auth_login',
    path: '/login',
    component: 'Login',
    layout: 'auth',
    visibility: 'public',
    requiredRoles: [],
    dataDependencies: [],
    rlsCritical: false
  },
  {
    id: 'auth_admin_login',
    path: '/admin/login',
    component: 'AdminLogin',
    layout: 'auth',
    visibility: 'admin_secret',
    requiredRoles: [],
    dataDependencies: [],
    rlsCritical: false
  },
  {
    id: 'auth_signup',
    path: '/signup',
    component: 'Signup',
    layout: 'auth',
    visibility: 'public',
    requiredRoles: [],
    dataDependencies: [],
    rlsCritical: false
  },
  {
    id: 'auth_extension',
    path: '/auth/chrome-extension',
    component: 'ExtensionAuth',
    layout: 'auth',
    visibility: 'public',
    requiredRoles: [],
    dataDependencies: [],
    rlsCritical: false
  },
  {
    id: 'onboarding',
    path: '/onboarding',
    component: 'Onboarding',
    layout: 'app',
    visibility: 'private',
    requiredRoles: [],
    dataDependencies: ['profiles'],
    tables: ['profiles', 'organizations'],
    rlsCritical: true
  },
  
  // --- ADMIN MASTER ---
  {
    id: 'admin_dashboard',
    path: '/admin/dashboard',
    component: 'AdminDashboard',
    layout: 'admin_master',
    visibility: 'private',
    requiredRoles: ['super_admin'],
    dataDependencies: ['organizations'],
    tables: ['organizations', 'profiles'],
    rlsCritical: true
  },
  {
    id: 'admin_agency_detail',
    path: '/admin/agencies/:id',
    component: 'AdminAgencyDetail',
    layout: 'admin_master',
    visibility: 'private',
    requiredRoles: ['super_admin'],
    params: ['id'],
    dataDependencies: ['organizations'],
    tables: ['organizations', 'profiles', 'subscriptions'],
    rlsCritical: true
  },

  // --- APP DASHBOARD ---
  {
    id: 'app_dashboard',
    path: '/',
    component: 'HomeOrApp',
    layout: 'app',
    visibility: 'private',
    requiredRoles: [], // Accessible to all authenticated org users, filtered internally
    dataDependencies: ['organizations'],
    rlsCritical: true
  },
  
  // --- CRM & CLIENTS ---
  {
    id: 'crm_clients',
    path: '/clients',
    component: 'Clients',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['clients'],
    tables: ['clients'],
    rlsCritical: true
  },
  {
    id: 'crm_sales_kanban',
    path: '/kanban/sales',
    component: 'KanbanBoard',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['clients', 'quotes'],
    tables: ['clients', 'quotes'],
    rlsCritical: true
  },
  
  // --- QUOTES & PROPOSALS ---
  {
    id: 'sales_quotations',
    path: '/quotations',
    component: 'Quotations',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['quotes', 'clients'],
    tables: ['quotes', 'clients'],
    rlsCritical: true
  },
  {
    id: 'sales_proposals',
    path: '/proposals',
    component: 'Proposals',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['proposals'],
    tables: ['proposals'],
    rlsCritical: true
  },
  {
    id: 'sales_proposal_edit',
    path: '/proposals/:id/edit',
    component: 'ProposalEditor',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    params: ['id'],
    dataDependencies: ['proposals'],
    tables: ['proposals'],
    rlsCritical: true
  },

  // --- VOUCHERS & CONTRACTS ---
  {
    id: 'ops_contracts',
    path: '/contracts',
    component: 'ContractRecords',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['contracts'],
    tables: ['contracts'],
    rlsCritical: true
  },
  {
    id: 'ops_vouchers',
    path: '/vouchers',
    component: 'Vouchers',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['vouchers'],
    tables: ['vouchers'],
    rlsCritical: true
  },

  // --- BOARDING & TRIPS ---
  {
    id: 'ops_departures',
    path: '/kanban/departures',
    component: 'DeparturesKanban',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['boarding_documents'],
    tables: ['boarding_documents', 'trips'],
    rlsCritical: true
  },
  {
    id: 'ops_group_trips',
    path: '/group-trips',
    component: 'GroupTrips',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['group_trips'],
    tables: ['group_trips'],
    rlsCritical: true
  },
  {
    id: 'ops_group_trip_detail',
    path: '/group-trips/:id',
    component: 'GroupDashboard',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    params: ['id'],
    dataDependencies: ['group_trips'],
    tables: ['group_trips'],
    rlsCritical: true
  },
  
  // --- FINANCE & COMMISSIONS ---
  {
    id: 'fin_payments',
    path: '/finance/payments',
    component: 'Payments',
    layout: 'agency_admin',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'support'],
    dataDependencies: ['payments'],
    tables: ['payments'],
    rlsCritical: true
  },
  {
    id: 'fin_transactions',
    path: '/finance/transactions',
    component: 'Transactions',
    layout: 'agency_admin',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'support'],
    dataDependencies: ['transactions'],
    tables: ['transactions'],
    rlsCritical: true
  },
  {
    id: 'fin_commissions_admin',
    path: '/app/admin/commissions',
    component: 'CommissionReports',
    layout: 'agency_admin',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin'],
    dataDependencies: ['agent_commission_entries'],
    tables: ['agent_commission_entries'],
    rlsCritical: true
  },
  {
    id: 'fin_my_commissions',
    path: '/app/my-commissions',
    component: 'MyCommissions',
    layout: 'agent',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['agent_commission_entries'],
    tables: ['agent_commission_entries'],
    rlsCritical: true
  },

  // --- BUILDER & CMS ---
  {
    id: 'cms_turisyou',
    path: '/turisyou',
    component: 'TurisYouDashboard',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['builder_sites'],
    tables: ['builder_sites'],
    rlsCritical: true
  },
  {
    id: 'cms_builder',
    path: '/site-builder',
    component: 'SiteBuilderPage',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['builder_sites', 'builder_pages'],
    tables: ['builder_sites', 'builder_pages', 'builder_blocks_registry'],
    rlsCritical: true
  },
  
  // --- ANALYTICS & AI ---
  {
    id: 'data_analytics',
    path: '/analytics',
    component: 'Analytics',
    layout: 'app',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'agent', 'support'],
    dataDependencies: ['builder_analytics_events'],
    tables: ['builder_analytics_events'],
    rlsCritical: true
  },
  {
    id: 'ai_dashboard',
    path: '/ai-dashboard',
    component: 'AiDashboard',
    layout: 'agency_admin',
    visibility: 'private',
    requiredRoles: ['org_admin', 'super_admin', 'support'],
    dataDependencies: ['ai_agent_runs'],
    tables: ['ai_agent_runs'],
    rlsCritical: true
  },

  // --- PUBLIC ROUTES (TOKENS & SLUGS) ---
  {
    id: 'pub_site',
    path: '/site/:slug',
    component: 'PublicSiteView',
    layout: 'public',
    visibility: 'public',
    requiredRoles: [],
    params: ['slug'],
    dataDependencies: ['builder_sites', 'builder_pages'],
    tables: ['builder_sites', 'builder_pages'],
    rlsCritical: true
  },
  {
    id: 'pub_proposal',
    path: '/p/:token',
    component: 'PublicProposal',
    layout: 'public',
    visibility: 'token',
    requiredRoles: [],
    params: ['token'],
    dataDependencies: ['proposals'],
    tables: ['proposals'],
    rlsCritical: true
  },
  {
    id: 'pub_voucher',
    path: '/voucher/:token',
    component: 'PublicBookingVoucher',
    layout: 'public',
    visibility: 'token',
    requiredRoles: [],
    params: ['token'],
    dataDependencies: ['vouchers'],
    tables: ['vouchers'],
    rlsCritical: true
  },
  {
    id: 'pub_portal_client',
    path: '/portal/:org_slug',
    component: 'PortalLogin',
    layout: 'client_portal',
    visibility: 'public',
    requiredRoles: [],
    params: ['org_slug'],
    dataDependencies: ['organizations'],
    tables: ['organizations'],
    rlsCritical: true
  }
];

export const getRouteById = (id: string) => routeRegistry.find(r => r.id === id);
export const getRoutesByRole = (roles: string[]) => routeRegistry.filter(r => 
  r.requiredRoles.length === 0 || r.requiredRoles.some(role => roles.includes(role))
);
