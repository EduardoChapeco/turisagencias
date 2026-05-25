import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleGuard } from '@/components/RoleGuard';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuthStore } from '@/stores/authStore';

const Dashboard = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Signup = lazy(() => import('./pages/Signup'));
const ExtensionAuth = lazy(() => import('./pages/ExtensionAuth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Clients = lazy(() => import('./pages/Clients'));
const Quotations = lazy(() => import('./pages/Quotations'));

const Itineraries = lazy(() => import('./pages/Itineraries'));
const ItineraryBuilder = lazy(() => import('./pages/ItineraryBuilder'));
const PublicItinerary = lazy(() => import('./pages/PublicItinerary'));

const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));
const KanbanCardPage = lazy(() => import('./pages/KanbanCardPage'));
const DeparturesKanban = lazy(() => import('./pages/DeparturesKanban'));
const TasksKanban = lazy(() => import('./pages/TasksKanban'));
const Settings = lazy(() => import('./pages/Settings'));
const Integrations = lazy(() => import('./pages/Integrations'));
const AIChat = lazy(() => import('./pages/AIChat'));
const AiDashboard = lazy(() => import('./pages/AiDashboard'));

const Guides = lazy(() => import('./pages/Guides'));

const TravelerInfo = lazy(() => import('./pages/TravelerInfo'));

const Hotels = lazy(() => import('./pages/Hotels'));

const Tickets = lazy(() => import('./pages/Tickets'));
const Experiences = lazy(() => import('./pages/Experiences'));

const PortalLogin = lazy(() => import('./pages/PortalLogin'));
const PortalHome = lazy(() => import('./pages/PortalHome'));
const PortalTripDetail = lazy(() => import('./pages/PortalTripDetail'));
const PortalAiPhotos = lazy(() => import('./pages/PortalAiPhotos'));

const Payments = lazy(() => import('./pages/finance/Payments'));
const Suppliers = lazy(() => import('./pages/finance/Suppliers'));
const Transactions = lazy(() => import('./pages/finance/Transactions'));
const PendingCancellations = lazy(() => import('./pages/finance/PendingCancellations'));
const ContractTemplates = lazy(() => import('./pages/legal/ContractTemplates'));
const ContractRecords  = lazy(() => import('./pages/ContractRecords'));
const Vouchers         = lazy(() => import('./pages/Vouchers'));
const Automations = lazy(() => import('./pages/automations/Automations'));
const Team = lazy(() => import('./pages/admin/Team'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAgencyDetail = lazy(() => import('./pages/admin/AdminAgencyDetail'));

const RadarPortal = lazy(() => import('./pages/RadarPortal'));
const GlobalRadarMap = lazy(() => import('./pages/GlobalRadarMap'));
const NewsCMS = lazy(() => import('./pages/NewsCMS'));
const PublicNewsArticle = lazy(() => import('./pages/PublicNewsArticle'));
const Proposals = lazy(() => import('./pages/Proposals'));
const ProposalEditor = lazy(() => import('./pages/ProposalEditor'));
const PublicProposal = lazy(() => import('./pages/PublicProposal'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Pricing = lazy(() => import('./pages/Pricing'));

const PublicTravelerForm = lazy(() => import('./pages/PublicTravelerForm'));
const Analytics = lazy(() => import('./pages/Analytics'));
const PublicQuotation = lazy(() => import('./pages/PublicQuotation'));
const PublicChecklist = lazy(() => import('./pages/PublicChecklist'));
const PublicGuide = lazy(() => import('./pages/PublicGuide'));
const PublicTravelerInfo = lazy(() => import('./pages/PublicTravelerInfo'));

const GroupTrips       = lazy(() => import('./pages/GroupTrips'));
const GroupDashboard   = lazy(() => import('./pages/group-trips/GroupDashboard'));
const PublicGroupTrip  = lazy(() => import('./pages/PublicGroupTrip'));
const PublicBookingVoucher = lazy(() => import('./pages/PublicBookingVoucher'));
const TravelerPortal   = lazy(() => import('./pages/TravelerPortal'));
const Destinations     = lazy(() => import('./pages/Destinations'));
const PublicSiteView   = lazy(() => import('./pages/PublicSiteView'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
  },
});

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { organization, profile, roles, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;
  
  // Super Admins (Master) podem pular o onboarding mesmo que a org não esteja carregada
  const isMaster = roles.includes('super_admin');
  
  // O usuário não precisa de onboarding se:
  // 1. A organização já foi carregada
  // 2. O perfil já tem um org_id (a org pode estar falhando por RLS race condition)
  // 3. For super admin
  const hasOrg = !!organization || !!profile?.org_id || isMaster;
  
  if (!hasOrg) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

function ProtectedWithOrg({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <OnboardingGuard>{children}</OnboardingGuard>
    </ProtectedRoute>
  );
}

function HomeOrApp() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <Loading />;
  if (user) return <ProtectedWithOrg><Dashboard /></ProtectedWithOrg>;
  return <LandingPage />;
}

function TripsRole({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['org_admin', 'super_admin', 'agent', 'support']}>
      {children}
    </RoleGuard>
  );
}

function AdminRole({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['org_admin', 'super_admin', 'support']}>
      {children}
    </RoleGuard>
  );
}

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth/chrome-extension" element={<ExtensionAuth />} />
              <Route path="/f/:token" element={<PublicTravelerForm />} />
              <Route path="/q/:token" element={<PublicQuotation />} />
              <Route path="/c/:token" element={<PublicChecklist />} />
              <Route path="/p/guide/:slug" element={<PublicGuide />} />
              <Route path="/p/info/:slug" element={<PublicTravelerInfo />} />
              <Route path="/g/:slug" element={<PublicGroupTrip />} />
              <Route path="/voucher/:token" element={<PublicBookingVoucher />} />
              <Route path="/minha-viagem/:token" element={<TravelerPortal />} />
              <Route path="/portal/:org_slug" element={<PortalLogin />} />
              <Route path="/noticias/:slug" element={<PublicNewsArticle />} />
              <Route path="/p/:token" element={<PublicProposal />} />
              <Route path="/portal/:org_slug/home" element={<ProtectedRoute><PortalHome /></ProtectedRoute>} />
              <Route path="/portal/:org_slug/trip/:id" element={<ProtectedRoute><PortalTripDetail /></ProtectedRoute>} />
              <Route path="/portal/:org_slug/trip/:trip_id/ai-photos" element={<ProtectedRoute><PortalAiPhotos /></ProtectedRoute>} />

              <Route path="/site/:slug" element={<PublicSiteView />} />
              <Route path="/site/:slug/bio" element={<PublicSiteView />} />
              <Route path="/site/:slug/blog" element={<PublicSiteView />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              <Route path="/" element={<HomeOrApp />} />
              <Route path="/radar" element={<ProtectedWithOrg><RadarPortal /></ProtectedWithOrg>} />
              <Route path="/radar-global" element={<ProtectedWithOrg><GlobalRadarMap /></ProtectedWithOrg>} />
              <Route path="/news-cms" element={<ProtectedWithOrg><TripsRole><NewsCMS /></TripsRole></ProtectedWithOrg>} />
              <Route path="/proposals" element={<ProtectedWithOrg><TripsRole><Proposals /></TripsRole></ProtectedWithOrg>} />
              <Route path="/proposals/:id/edit" element={<ProtectedWithOrg><TripsRole><ProposalEditor /></TripsRole></ProtectedWithOrg>} />

              <Route path="/clients" element={<ProtectedWithOrg><Clients /></ProtectedWithOrg>} />

              <Route path="/quotations" element={<ProtectedWithOrg><Quotations /></ProtectedWithOrg>} />

              <Route path="/itineraries" element={<ProtectedWithOrg><Itineraries /></ProtectedWithOrg>} />
              <Route path="/itineraries/:id/builder" element={<ProtectedWithOrg><ItineraryBuilder /></ProtectedWithOrg>} />
              <Route path="/roteiro/:token" element={<PublicItinerary />} />

              <Route path="/kanban/sales" element={<ProtectedWithOrg><TripsRole><KanbanBoard /></TripsRole></ProtectedWithOrg>} />
              <Route path="/kanban/departures" element={<ProtectedWithOrg><TripsRole><DeparturesKanban /></TripsRole></ProtectedWithOrg>} />
              <Route path="/kanban/tasks" element={<ProtectedWithOrg><TripsRole><TasksKanban /></TripsRole></ProtectedWithOrg>} />
              <Route path="/ai-chat" element={<ProtectedWithOrg><TripsRole><AIChat /></TripsRole></ProtectedWithOrg>} />
              <Route path="/ai-dashboard" element={<ProtectedWithOrg><AdminRole><AiDashboard /></AdminRole></ProtectedWithOrg>} />
              <Route path="/settings" element={<ProtectedWithOrg><TripsRole><Settings /></TripsRole></ProtectedWithOrg>} />
              <Route path="/integrations" element={<ProtectedWithOrg><TripsRole><Integrations /></TripsRole></ProtectedWithOrg>} />
              
              {/* ERP v3 Financeiro & Jurídico */}
              <Route path="/finance/payments" element={<ProtectedWithOrg><AdminRole><Payments /></AdminRole></ProtectedWithOrg>} />
              <Route path="/finance/suppliers" element={<ProtectedWithOrg><AdminRole><Suppliers /></AdminRole></ProtectedWithOrg>} />
              <Route path="/finance/transactions" element={<ProtectedWithOrg><AdminRole><Transactions /></AdminRole></ProtectedWithOrg>} />
              <Route path="/finance/cancellations" element={<ProtectedWithOrg><AdminRole><PendingCancellations /></AdminRole></ProtectedWithOrg>} />
              <Route path="/legal/contracts" element={<ProtectedWithOrg><AdminRole><ContractTemplates /></AdminRole></ProtectedWithOrg>} />
              {/* Fusion: contratos gerados + vouchers */}
              <Route path="/contracts" element={<ProtectedWithOrg><TripsRole><ContractRecords /></TripsRole></ProtectedWithOrg>} />
              <Route path="/vouchers"  element={<ProtectedWithOrg><TripsRole><Vouchers /></TripsRole></ProtectedWithOrg>} />
              <Route path="/automations" element={<ProtectedWithOrg><AdminRole><Automations /></AdminRole></ProtectedWithOrg>} />
              <Route path="/team" element={<ProtectedWithOrg><AdminRole><Team /></AdminRole></ProtectedWithOrg>} />
              <Route path="/admin/dashboard" element={<ProtectedWithOrg><AdminRole><AdminDashboard /></AdminRole></ProtectedWithOrg>} />
              <Route path="/admin/agencies/:id" element={<ProtectedWithOrg><AdminRole><AdminAgencyDetail /></AdminRole></ProtectedWithOrg>} />

              {/* CRM */}
              <Route path="/guides" element={<ProtectedWithOrg><TripsRole><Guides /></TripsRole></ProtectedWithOrg>} />

              <Route path="/info" element={<ProtectedWithOrg><TripsRole><TravelerInfo /></TripsRole></ProtectedWithOrg>} />

              <Route path="/hotels" element={<ProtectedWithOrg><TripsRole><Hotels /></TripsRole></ProtectedWithOrg>} />

              <Route path="/tickets" element={<ProtectedWithOrg><TripsRole><Tickets /></TripsRole></ProtectedWithOrg>} />

              <Route path="/experiences" element={<ProtectedWithOrg><TripsRole><Experiences /></TripsRole></ProtectedWithOrg>} />

              <Route path="/group-trips" element={<ProtectedWithOrg><TripsRole><GroupTrips /></TripsRole></ProtectedWithOrg>} />
              <Route path="/group-trips/:id" element={<ProtectedWithOrg><TripsRole><GroupDashboard /></TripsRole></ProtectedWithOrg>} />
              <Route path="/destinations" element={<ProtectedWithOrg><TripsRole><Destinations /></TripsRole></ProtectedWithOrg>} />
              <Route path="/analytics" element={<ProtectedWithOrg><TripsRole><Analytics /></TripsRole></ProtectedWithOrg>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
