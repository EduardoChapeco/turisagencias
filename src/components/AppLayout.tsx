import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Settings, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PageHeaderPortalContext } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children, fullHeight }: { children: React.ReactNode; fullHeight?: boolean }) {
  const { profile, organization } = useAuthStore();
  const navigate = useNavigate();
  const [pageHeaderTarget, setPageHeaderTarget] = useState<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <PageHeaderPortalContext.Provider value={pageHeaderTarget}>
      <div className="flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-vj-bg selection:bg-vj-green/20 no-scrollbar">
        <AppSidebar />
        
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative no-scrollbar">
          
          {/* 🏛️ PREMIUM OMEGA HEADER - SHADOWLESS */}
          <header className="z-50 flex h-[70px] shrink-0 items-center justify-between gap-4 border-b border-vj-border bg-white/80 px-8 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <SidebarTrigger className="h-11 w-11 shrink-0 text-vj-txt3 hover:text-vj-txt hover:bg-zinc-100 rounded-2xl transition-all" />
              
              {/* Contextual Page Header Portal */}
              <div ref={setPageHeaderTarget} className="min-w-0 flex-1" />
            </div>

            <div className="flex shrink-0 items-center gap-4">
              {/* Global Search Bar - Premium Style */}
              <div className="hidden md:flex items-center gap-3 bg-zinc-100/80 border border-transparent focus-within:border-vj-green/30 focus-within:bg-white px-4 py-2 rounded-2xl w-64 lg:w-80 transition-all duration-300">
                <Search className="w-4 h-4 text-vj-txt3" />
                <Input placeholder="Buscar no Turis Agências..." className="bg-transparent border-none text-xs h-6 p-0 focus-visible:ring-0 placeholder:text-vj-txt3/60 font-medium" />
                <span className="text-[10px] font-black bg-white border border-zinc-200 px-2 py-0.5 rounded-lg text-vj-txt3 ">⌘K</span>
              </div>

              <div className="h-6 w-px bg-vj-border mx-2 hidden md:block" />

              <NotificationPanel />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-zinc-100 transition-all border border-transparent hover:border-vj-border/60">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-black text-white bg-vj-green transition-transform group-hover:scale-110"
                    >
                      {(profile?.first_name?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                       <p className="text-xs font-black text-vj-txt leading-none">{profile?.first_name || 'Agente'}</p>
                       <p className="text-[9px] font-bold text-vj-txt3 uppercase tracking-widest mt-1">{organization?.name || 'Agência'}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-[1.5rem] border-vj-border bg-white  animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black text-vj-txt">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs font-bold text-vj-txt3">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-vj-border/50 mx-2" />
                  <div className="p-1 space-y-1">
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl cursor-pointer gap-3 px-4 py-2.5 focus:bg-vj-green/5 focus:text-vj-green">
                      <Settings className="h-4 w-4" />
                      <span className="font-bold text-xs">Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl cursor-pointer gap-3 px-4 py-2.5 focus:bg-vj-green/5 focus:text-vj-green">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-bold text-xs">Turis Intel Lab</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-vj-border/50 mx-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 gap-3 px-4 py-2.5">
                    <LogOut className="h-4 w-4" />
                    <span className="font-bold text-xs">Sair da Sessão</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* MAIN VIEWPORT - STRUCTURED & PREMIUM */}
          <main className={`min-h-0 flex-1 relative flex flex-col no-scrollbar ${fullHeight ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div className={`mx-auto w-full min-h-0 animate-in fade-in duration-700 ${fullHeight ? 'flex flex-1 flex-col p-6 lg:p-8' : 'max-w-[1600px] p-8 lg:p-12'}`}>
              {children}
            </div>
            
            {/* Subtle Gradient for Depth (No Shadows) */}
            {!fullHeight && (
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-vj-green/5 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />
            )}
          </main>
        </div>
      </div>
      </PageHeaderPortalContext.Provider>
    </SidebarProvider>
  );
}
