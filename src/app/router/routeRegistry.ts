export type LayoutType = 'app' | 'admin_master' | 'agency_admin' | 'agent' | 'public' | 'client_portal' | 'auth';
export type VisibilityType = 'private' | 'public' | 'token' | 'admin_secret';

export type AppRouteContract = {
 id: string;
 path: string;
 component: string;
 layout: LayoutType;
 visibility: VisibilityType;
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

export const APP_ROUTES: AppRouteContract[] = [
 // AUTH
 { id: 'login', path: '/login', component: 'Login', layout: 'auth', visibility: 'public', requiredRoles: [], dataDependencies: [], rlsCritical: false },
 { id: 'admin-login', path: '/admin/login', component: 'AdminLogin', layout: 'auth', visibility: 'admin_secret', requiredRoles: [], dataDependencies: [], rlsCritical: false },
 { id: 'signup', path: '/signup', component: 'Signup', layout: 'auth', visibility: 'public', requiredRoles: [], dataDependencies: [], rlsCritical: false },
 { id: 'onboarding', path: '/onboarding', component: 'Onboarding', layout: 'auth', visibility: 'private', requiredRoles: [], dataDependencies: ['organizations'], rlsCritical: false },
 // APP PRINCIPAL
 { id: 'dashboard', path: '/', component: 'Index', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['organizations','profiles'], tables: ['organizations','profiles'], rlsCritical: true, navGroup: 'main', breadcrumb: ['Dashboard'] },
 { id: 'clients', path: '/clients', component: 'Clients', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['clients'], tables: ['clients'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['CRM', 'Clientes'] },
 { id: 'quotations', path: '/quotations', component: 'Quotations', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['quotations'], tables: ['quotations'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Cotações'] },
 { id: 'proposals', path: '/proposals', component: 'Proposals', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['proposals'], tables: ['proposals'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Propostas'] },
 { id: 'proposal-editor', path: '/proposals/:id/edit', component: 'ProposalEditor', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], params: ['id'], dataDependencies: ['proposals','quotations'], tables: ['proposals','quotations'], rlsCritical: true, breadcrumb: ['Propostas', 'Editor'] },
 { id: 'contracts', path: '/contracts', component: 'ContractRecords', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['contract_records'], tables: ['contract_records'], rlsCritical: true, navGroup: 'legal', breadcrumb: ['Contratos'] },
 { id: 'vouchers', path: '/vouchers', component: 'Vouchers', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['vouchers'], tables: ['vouchers'], rlsCritical: true, navGroup: 'legal', breadcrumb: ['Vouchers'] },
 { id: 'kanban-sales', path: '/kanban/sales', component: 'KanbanBoard', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['kanban_boards','kanban_cards'], tables: ['kanban_boards','kanban_cards'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Kanban', 'Vendas'] },
 { id: 'kanban-departures', path: '/kanban/departures', component: 'DeparturesKanban', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['kanban_boards','kanban_cards'], tables: ['kanban_boards','kanban_cards'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Kanban', 'Embarques'] },
 { id: 'kanban-tasks', path: '/kanban/tasks', component: 'TasksKanban', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['kanban_boards','kanban_cards'], tables: ['kanban_boards','kanban_cards'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Kanban', 'Tarefas'] },
 { id: 'group-trips', path: '/group-trips', component: 'GroupTrips', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['group_trips'], tables: ['group_trips'], rlsCritical: true, navGroup: 'trips', breadcrumb: ['Viagens em Grupo'] },
 { id: 'group-trip-detail', path: '/group-trips/:id', component: 'GroupDashboard', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], params: ['id'], dataDependencies: ['group_trips','group_clients'], tables: ['group_trips','group_clients'], rlsCritical: true, breadcrumb: ['Viagens em Grupo', 'Detalhe'] },
 { id: 'site-builder', path: '/site-builder', component: 'SiteBuilderPage', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['builder_projects','builder_versions'], tables: ['builder_projects','builder_versions'], rlsCritical: true, navGroup: 'content', breadcrumb: ['Site Builder'] },
 { id: 'analytics', path: '/analytics', component: 'Analytics', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['org_analytics_summary'], tables: ['org_analytics_summary'], rlsCritical: true, navGroup: 'main', breadcrumb: ['Analytics'] },
 { id: 'automations', path: '/automations', component: 'Automations', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['automation_rules'], tables: ['automation_rules'], rlsCritical: true, navGroup: 'settings', breadcrumb: ['Automações'] },
 { id: 'settings', path: '/settings', component: 'Settings', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['organizations','profiles'], tables: ['organizations','profiles'], rlsCritical: true, navGroup: 'settings', breadcrumb: ['Configurações'] },
 { id: 'tickets', path: '/tickets', component: 'Tickets', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['tickets'], tables: ['tickets'], rlsCritical: true, navGroup: 'support', breadcrumb: ['Tickets'] },
 { id: 'ai-chat', path: '/ai-chat', component: 'AIChat', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['ai_agents'], tables: ['ai_agents'], rlsCritical: true, navGroup: 'ai', breadcrumb: ['IA Chat'] },
 { id: 'ai-dashboard', path: '/ai-dashboard', component: 'AiDashboard', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['ai_agents','ai_tasks'], tables: ['ai_agents','ai_tasks'], rlsCritical: true, navGroup: 'ai', breadcrumb: ['IA Dashboard'] },
 { id: 'news-cms', path: '/news-cms', component: 'NewsCMS', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['news_articles'], tables: ['news_articles'], rlsCritical: true, navGroup: 'content', breadcrumb: ['CMS Notícias'] },
 { id: 'itineraries', path: '/itineraries', component: 'Itineraries', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['itineraries'], tables: ['itineraries'], rlsCritical: true, navGroup: 'crm', breadcrumb: ['Roteiros'] },
 { id: 'portal-manager', path: '/portal-manager', component: 'PortalManagerPage', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['group_trips'], tables: ['group_trips'], rlsCritical: true, navGroup: 'trips', breadcrumb: ['Gerenciador de Portais'] },
 // FINANCE
 { id: 'finance-payments', path: '/app/finance/payments', component: 'Payments', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['payments'], tables: ['payments'], rlsCritical: true, navGroup: 'finance', breadcrumb: ['Financeiro', 'Pagamentos'] },
 { id: 'finance-suppliers', path: '/app/finance/suppliers', component: 'Suppliers', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['suppliers'], tables: ['suppliers'], rlsCritical: true, navGroup: 'finance', breadcrumb: ['Financeiro', 'Fornecedores'] },
 { id: 'finance-transactions', path: '/app/finance/transactions', component: 'Transactions', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['financial_transactions'], tables: ['financial_transactions'], rlsCritical: true, navGroup: 'finance', breadcrumb: ['Financeiro', 'Transações'] },
 { id: 'finance-commissions', path: '/app/finance/commissions', component: 'CommissionsPanel', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['agent_commission_entries'], tables: ['agent_commission_entries'], rlsCritical: true, navGroup: 'finance', breadcrumb: ['Financeiro', 'Comissões'] },
 { id: 'my-commissions', path: '/app/my-commissions', component: 'MyCommissions', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['agent_commission_entries'], tables: ['agent_commission_entries'], rlsCritical: true, navGroup: 'finance', breadcrumb: ['Minhas Comissões'] },
 // ADMIN MASTER
 { id: 'admin-dashboard', path: '/admin/dashboard', component: 'AdminDashboard', layout: 'admin_master', visibility: 'admin_secret', requiredRoles: ['super_admin'], dataDependencies: ['organizations'], tables: ['organizations'], rlsCritical: true, navGroup: 'admin', breadcrumb: ['Admin', 'Dashboard'] },
 { id: 'admin-agency-detail', path: '/admin/agencies/:id', component: 'AdminAgencyDetail', layout: 'admin_master', visibility: 'admin_secret', requiredRoles: ['super_admin'], params: ['id'], dataDependencies: ['organizations'], tables: ['organizations'], rlsCritical: true, breadcrumb: ['Admin', 'Agência'] },
 { id: 'admin-commissions', path: '/app/admin/commissions', component: 'CommissionReports', layout: 'admin_master', visibility: 'admin_secret', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['agent_commission_entries'], tables: ['agent_commission_entries'], rlsCritical: true, breadcrumb: ['Admin', 'Comissões'] },
 { id: 'admin-support', path: '/app/admin/support', component: 'SupportAdmin', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin','agent','support'], dataDependencies: ['tickets'], tables: ['tickets'], rlsCritical: true, breadcrumb: ['Admin', 'Suporte'] },
 { id: 'admin-blog', path: '/app/admin/blog', component: 'BlogAdmin', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['news_articles'], tables: ['news_articles'], rlsCritical: true, breadcrumb: ['Admin', 'Blog'] },
 { id: 'legal-contracts', path: '/legal/contracts', component: 'ContractTemplates', layout: 'app', visibility: 'private', requiredRoles: ['org_admin','super_admin'], dataDependencies: ['contract_templates'], tables: ['contract_templates'], rlsCritical: true, navGroup: 'legal', breadcrumb: ['Jurídico', 'Templates'] },
 // PUBLIC
 { id: 'public-traveler-form', path: '/f/:token', component: 'PublicTravelerForm', layout: 'public', visibility: 'token', requiredRoles: [], params: ['token'], dataDependencies: ['travelers','public_access_tokens'], tables: ['travelers'], rlsCritical: false, breadcrumb: ['Formulário do Viajante'] },
 { id: 'public-quotation', path: '/q/:token', component: 'PublicQuotation', layout: 'public', visibility: 'token', requiredRoles: [], params: ['token'], dataDependencies: ['quotations'], tables: ['quotations'], rlsCritical: false, breadcrumb: ['Cotação'] },
 { id: 'public-proposal', path: '/p/:token', component: 'PublicProposal', layout: 'public', visibility: 'token', requiredRoles: [], params: ['token'], dataDependencies: ['proposals'], tables: ['proposals'], rlsCritical: false, breadcrumb: ['Proposta'] },
 { id: 'public-checklist', path: '/c/:token', component: 'PublicChecklist', layout: 'public', visibility: 'token', requiredRoles: [], params: ['token'], dataDependencies: ['checklists'], tables: ['checklists'], rlsCritical: false, breadcrumb: ['Checklist'] },
 { id: 'public-group-trip', path: '/g/:slug', component: 'PublicGroupTrip', layout: 'public', visibility: 'public', requiredRoles: [], params: ['slug'], dataDependencies: ['group_trips'], tables: ['group_trips'], rlsCritical: false, breadcrumb: ['Viagem em Grupo'] },
 { id: 'public-site', path: '/site/:slug', component: 'PublicSiteView', layout: 'public', visibility: 'public', requiredRoles: [], params: ['slug'], dataDependencies: ['builder_projects','builder_versions','public_sites'], tables: ['builder_projects','builder_versions'], rlsCritical: false },
 { id: 'public-guide', path: '/p/guide/:slug', component: 'PublicGuide', layout: 'public', visibility: 'public', requiredRoles: [], params: ['slug'], dataDependencies: ['guides'], tables: ['guides'], rlsCritical: false },
 { id: 'portal-login', path: '/portal/:org_slug', component: 'PortalLogin', layout: 'client_portal', visibility: 'public', requiredRoles: [], params: ['org_slug'], dataDependencies: ['organizations'], tables: ['organizations'], rlsCritical: false },
 { id: 'portal-home', path: '/portal/:org_slug/home', component: 'PortalHome', layout: 'client_portal', visibility: 'private', requiredRoles: [], params: ['org_slug'], dataDependencies: ['group_trips'], tables: ['group_trips'], rlsCritical: true },
 { id: 'signature-certificate', path: '/certificate/:hash', component: 'SignatureCertificate', layout: 'public', visibility: 'public', requiredRoles: [], params: ['hash'], dataDependencies: ['contract_records'], tables: ['contract_records'], rlsCritical: false },
 { id: 'public-news-article', path: '/noticias/:slug', component: 'PublicNewsArticle', layout: 'public', visibility: 'public', requiredRoles: [], params: ['slug'], dataDependencies: ['news_articles'], tables: ['news_articles'], rlsCritical: false },
 { id: 'help-center', path: '/:org_slug/ajuda', component: 'HelpCenter', layout: 'public', visibility: 'public', requiredRoles: [], params: ['org_slug'], dataDependencies: ['tickets'], tables: ['tickets'], rlsCritical: false },
 { id: 'blog-public', path: '/:org_slug/blog', component: 'BlogPublic', layout: 'public', visibility: 'public', requiredRoles: [], params: ['org_slug'], dataDependencies: ['news_articles'], tables: ['news_articles'], rlsCritical: false },
];

export function findRoute(id: string): AppRouteContract | undefined {
 return APP_ROUTES.find(r => r.id === id);
}

export function getRoutesByRole(role: string): AppRouteContract[] {
 return APP_ROUTES.filter(r => r.requiredRoles.length === 0 || r.requiredRoles.includes(role));
}

export function getRoutesByNavGroup(group: string): AppRouteContract[] {
 return APP_ROUTES.filter(r => r.navGroup === group);
}

export function getPublicRoutes(): AppRouteContract[] {
 return APP_ROUTES.filter(r => r.visibility === 'public' || r.visibility === 'token');
}
