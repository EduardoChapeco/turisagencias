import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children, fullHeight }: { children: React.ReactNode; fullHeight?: boolean }) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-vj-bg overflow-hidden">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header — 50px, blur, neutro */}
          <header
            className="flex h-[50px] items-center gap-3 px-4 shrink-0 border-b border-vj-border bg-vj-bg/90 backdrop-blur-md"
            style={{ position: 'sticky', top: 0, zIndex: 90 }}
          >
            <SidebarTrigger className="h-8 w-8 text-vj-txt3 hover:text-vj-txt" />

            <div className="ml-auto flex items-center gap-4">
              <NotificationPanel />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'var(--green-bg)', border: '1px solid rgba(26,122,74,.2)', color: 'var(--green)' }}
                  >
                    {(profile?.first_name?.[0] || '?').toUpperCase()}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-vj-r border-vj-border bg-vj-bg shadow-sm">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-vj-txt">
                        {profile?.first_name || 'Agente'}
                      </p>
                      <p className="text-xs leading-none text-vj-txt3">
                        {profile?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-vj-border" />
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer gap-2 focus:bg-vj-surface focus:text-vj-txt">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:bg-red-50/50 focus:text-red-600 gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sair do sistema</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </header>

          <main className={`flex-1 p-3 sm:p-5 lg:p-8 ${fullHeight ? 'overflow-hidden flex flex-col min-h-0' : 'overflow-auto'}`}>
            <div className={`mx-auto w-full animate-in ${fullHeight ? 'flex-1 min-h-0 flex flex-col' : 'max-w-[1400px]'}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
