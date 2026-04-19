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
const Signup = lazy(() => import('./pages/Signup'));
const ExtensionAuth = lazy(() => import('./pages/ExtensionAuth'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Clients = lazy(() => import('./pages/Clients'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));

const Quotations = lazy(() => import('./pages/Quotations'));
const QuotationDetail = lazy(() => import('./pages/QuotationDetail'));

const Itineraries = lazy(() => import('./pages/Itineraries'));
const ItineraryBuilder = lazy(() => import('./pages/ItineraryBuilder'));
const PublicItinerary = lazy(() => import('./pages/PublicItinerary'));

const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));
const DeparturesKanban = lazy(() => import('./pages/DeparturesKanban'));
const TasksKanban = lazy(() => import('./pages/TasksKanban'));
const Settings = lazy(() => import('./pages/Settings'));
const AIChat = lazy(() => import('./pages/AIChat'));

const Guides = lazy(() => import('./pages/Guides'));
const GuideDetail = lazy(() => import('./pages/GuideDetail'));

const TravelerInfo = lazy(() => import('./pages/TravelerInfo'));

const Hotels = lazy(() => import('./pages/Hotels'));
const HotelDetail = lazy(() => import('./pages/HotelDetail'));

const Tickets = lazy(() => import('./pages/Tickets'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const Experiences = lazy(() => import('./pages/Experiences'));

const PortalLogin = lazy(() => import('./pages/PortalLogin'));
const PortalHome = lazy(() => import('./pages/PortalHome'));
const PortalTripDetail = lazy(() => import('./pages/PortalTripDetail'));
const PortalAiPhotos = lazy(() => import('./pages/PortalAiPhotos'));

const Suppliers = lazy(() => import('./pages/finance/Suppliers'));
const Transactions = lazy(() => import('./pages/finance/Transactions'));
const PendingCancellations = lazy(() => import('./pages/finance/PendingCancellations'));
const ContractTemplates = lazy(() => import('./pages/legal/ContractTemplates'));
const Automations = lazy(() => import('./pages/automations/Automations'));
const Team = lazy(() => import('./pages/admin/Team'));

const RadarPortal = lazy(() => import('./pages/RadarPortal'));
const GlobalRadarMap = lazy(() => import('./pages/GlobalRadarMap'));

const PublicTravelerForm = lazy(() => import('./pages/PublicTravelerForm'));
const PublicQuotation = lazy(() => import('./pages/PublicQuotation'));
const PublicChecklist = lazy(() => import('./pages/PublicChecklist'));
const PublicGuide = lazy(() => import('./pages/PublicGuide'));
const PublicTravelerInfo = lazy(() => import('./pages/PublicTravelerInfo'));

const GroupTrips       = lazy(() => import('./pages/GroupTrips'));
const GroupTripFinance = lazy(() => import('./pages/GroupTripFinance'));
const PublicGroupTrip  = lazy(() => import('./pages/PublicGroupTrip'));
const PublicBookingVoucher = lazy(() => import('./pages/PublicBookingVoucher'));
const TravelerPortal   = lazy(() => import('./pages/TravelerPortal'));
const Destinations     = lazy(() => import('./pages/Destinations'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
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
  const { organization, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;
  if (!organization) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function ProtectedWithOrg({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <OnboardingGuard>{children}</OnboardingGuard>
    </ProtectedRoute>
  );
}

function TripsRole({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['org_admin', 'super_admin', 'agent', 'support']}>
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
              <Route path="/signup" element={<Signup />} />
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
              <Route path="/portal/:org_slug/home" element={<ProtectedRoute><PortalHome /></ProtectedRoute>} />
              <Route path="/portal/:org_slug/trip/:id" element={<ProtectedRoute><PortalTripDetail /></ProtectedRoute>} />
              <Route path="/portal/:org_slug/trip/:trip_id/ai-photos" element={<ProtectedRoute><PortalAiPhotos /></ProtectedRoute>} />

              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              <Route path="/" element={<ProtectedWithOrg><Dashboard /></ProtectedWithOrg>} />
              <Route path="/radar" element={<ProtectedWithOrg><RadarPortal /></ProtectedWithOrg>} />
              <Route path="/radar-global" element={<ProtectedWithOrg><GlobalRadarMap /></ProtectedWithOrg>} />

              <Route path="/clients" element={<ProtectedWithOrg><Clients /></ProtectedWithOrg>} />
              <Route path="/clients/:id" element={<ProtectedWithOrg><ClientDetail /></ProtectedWithOrg>} />

              <Route path="/quotations" element={<ProtectedWithOrg><Quotations /></ProtectedWithOrg>} />
              <Route path="/quotations/:id" element={<ProtectedWithOrg><QuotationDetail /></ProtectedWithOrg>} />

              <Route path="/itineraries" element={<ProtectedWithOrg><Itineraries /></ProtectedWithOrg>} />
              <Route path="/itineraries/:id/builder" element={<ProtectedWithOrg><ItineraryBuilder /></ProtectedWithOrg>} />
              <Route path="/roteiro/:token" element={<PublicItinerary />} />

              <Route path="/kanban/sales" element={<ProtectedWithOrg><TripsRole><KanbanBoard /></TripsRole></ProtectedWithOrg>} />
              <Route path="/kanban/departures" element={<ProtectedWithOrg><TripsRole><DeparturesKanban /></TripsRole></ProtectedWithOrg>} />
              <Route path="/kanban/tasks" element={<ProtectedWithOrg><TripsRole><TasksKanban /></TripsRole></ProtectedWithOrg>} />
              <Route path="/ai-chat" element={<ProtectedWithOrg><TripsRole><AIChat /></TripsRole></ProtectedWithOrg>} />
              <Route path="/settings" element={<ProtectedWithOrg><TripsRole><Settings /></TripsRole></ProtectedWithOrg>} />
              
              {/* ERP v3 Financeiro & Jurídico */}
              <Route path="/finance/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
              <Route path="/finance/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/finance/cancellations" element={<ProtectedRoute><PendingCancellations /></ProtectedRoute>} />
              <Route path="/legal/contracts" element={<ProtectedRoute><ContractTemplates /></ProtectedRoute>} />
              <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />

              {/* CRM Legacy */}
              <Route path="/guides" element={<ProtectedWithOrg><TripsRole><Guides /></TripsRole></ProtectedWithOrg>} />
              <Route path="/guides/:id" element={<ProtectedWithOrg><TripsRole><GuideDetail /></TripsRole></ProtectedWithOrg>} />

              <Route path="/info" element={<ProtectedWithOrg><TripsRole><TravelerInfo /></TripsRole></ProtectedWithOrg>} />

              <Route path="/hotels" element={<ProtectedWithOrg><TripsRole><Hotels /></TripsRole></ProtectedWithOrg>} />
              <Route path="/hotels/:id" element={<ProtectedWithOrg><TripsRole><HotelDetail /></TripsRole></ProtectedWithOrg>} />

              <Route path="/tickets" element={<ProtectedWithOrg><TripsRole><Tickets /></TripsRole></ProtectedWithOrg>} />
              <Route path="/tickets/:id" element={<ProtectedWithOrg><TripsRole><TicketDetail /></TripsRole></ProtectedWithOrg>} />

              <Route path="/experiences" element={<ProtectedWithOrg><TripsRole><Experiences /></TripsRole></ProtectedWithOrg>} />

              <Route path="/group-trips" element={<ProtectedWithOrg><TripsRole><GroupTrips /></TripsRole></ProtectedWithOrg>} />
              <Route path="/group-trips/:id/finance" element={<ProtectedWithOrg><TripsRole><GroupTripFinance /></TripsRole></ProtectedWithOrg>} />
              <Route path="/destinations" element={<ProtectedWithOrg><TripsRole><Destinations /></TripsRole></ProtectedWithOrg>} />

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
