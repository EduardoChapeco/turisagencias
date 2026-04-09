import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const NotFound = lazy(() => import('./pages/NotFound'));

// CRM
const Clients = lazy(() => import('./pages/Clients'));
const ClientNew = lazy(() => import('./pages/ClientNew'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const ClientEdit = lazy(() => import('./pages/ClientEdit'));
const PublicTravelerForm = lazy(() => import('./pages/PublicTravelerForm'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/f/:token" element={<PublicTravelerForm />} />

              {/* Auth but no org required */}
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

              {/* Protected + Org required */}
              <Route path="/" element={<ProtectedWithOrg><Dashboard /></ProtectedWithOrg>} />
              <Route path="/clients" element={<ProtectedWithOrg><Clients /></ProtectedWithOrg>} />
              <Route path="/clients/new" element={<ProtectedWithOrg><ClientNew /></ProtectedWithOrg>} />
              <Route path="/clients/:id" element={<ProtectedWithOrg><ClientDetail /></ProtectedWithOrg>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
