import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, Settings, Search, Sparkles, Info } from 'lucide-react';
import { useState } from 'react';
import { PageHeaderPortalContext } from '@/components/ui/PageHeader';
import { PageInfoProvider, usePageInfo } from '@/contexts/PageInfoContext';
import { Input } from '@/components/ui/input';
import { SheetPage } from '@/components/ui/SheetPage';
import { AIStatusIndicator } from '@/components/ai/AIStatusIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Conteúdo interno do header que lê o context ──
function HeaderBar() {
  const { profile, organization } = useAuthStore();
  const navigate = useNavigate();
  const { pageInfo } = usePageInfo();
  const [infoOpen, setInfoOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="z-40 flex h-[60px] shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 lg:px-5">

        {/* Esquerda: sidebar trigger + label da página + ⓘ */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <SidebarTrigger className="h-9 w-9 shrink-0 text-vj-txt3 hover:text-vj-txt hover:bg-zinc-100 rounded-xl transition-all" />

          {pageInfo?.title && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold text-vj-txt2 truncate hidden sm:block">
                {pageInfo.title}
              </span>

              {(pageInfo.description || pageInfo.title) && (
                <button
                  onClick={() => setInfoOpen(true)}
                  title={pageInfo.description || pageInfo.title}
                  className="flex items-center justify-center h-6 w-6 rounded-lg text-vj-txt3 hover:bg-zinc-100 hover:text-vj-txt focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all shrink-0"
                  aria-label="Informações da página"
                >
                  <Info size={13} />
                </button>
              )}
            </div>
          )}
        </div>
 
        {/* Direita: search + sino + avatar */}
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden lg:flex items-center relative w-52 xl:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vj-txt3 group-focus-within:text-vj-green transition-colors z-10" />
            <Input
              placeholder="Buscar..."
              className="pl-9 pr-10 h-9 bg-zinc-100/80 border-transparent focus:bg-white focus:border-vj-green/30 rounded-xl text-sm transition-all duration-300"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white border border-vj-border px-1 py-0.5 rounded-md text-[9px] font-black text-vj-txt3 pointer-events-none">
              <span className="opacity-50">⌘</span>
              <span>K</span>
            </div>
          </div>
 
          <NotificationPanel />
 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none transition-all border border-transparent hover:border-vj-border/60">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white bg-vj-green">
                  {(profile?.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-black text-vj-txt leading-none">{profile?.first_name || 'Agente'}</p>
                  <p className="text-[9px] font-bold text-vj-txt3 uppercase tracking-widest mt-0.5">{organization?.name || 'Agência'}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl border-vj-border bg-white animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="font-normal px-3 py-2.5">
                <div className="flex flex-col space-y-0.5">
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
                <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl cursor-pointer gap-3 px-3 py-2 focus:bg-vj-green/5 focus:text-vj-green">
                  <Settings className="h-4 w-4" />
                  <span className="font-bold text-xs">Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl cursor-pointer gap-3 px-3 py-2 focus:bg-vj-green/5 focus:text-vj-green">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-bold text-xs">Assistente IA</span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-vj-border/50 mx-2" />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 gap-3 px-3 py-2">
                <LogOut className="h-4 w-4" />
                <span className="font-bold text-xs">Sair da Sessão</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sheet de descrição da página — abre ao clicar no ⓘ */}
      {pageInfo && (
        <SheetPage
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title={pageInfo.title}
          icon={pageInfo.icon || Info}
          className="lg:w-[42vw] xl:w-[38vw]"
        >
          <div className="p-8 space-y-4 text-sm leading-relaxed text-vj-txt2 animate-in fade-in duration-500">
            {pageInfo.description && <p className="font-medium">{pageInfo.description}</p>}
          </div>
        </SheetPage>
      )}
    </>
  );
}

// ── AppLayout principal ──
export function AppLayout({ children, fullHeight }: { children: React.ReactNode; fullHeight?: boolean }) {
  // Context mantido para retrocompatibilidade (não usado com portal)
  const [pageHeaderTarget] = useState<HTMLDivElement | null>(null);

  return (
    <PageInfoProvider>
      <SidebarProvider>
        <PageHeaderPortalContext.Provider value={pageHeaderTarget}>
          <div className="flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-zinc-50 text-zinc-900 selection:bg-vj-green/20 no-scrollbar">
            <AppSidebar />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative no-scrollbar">
              <HeaderBar />

              <main className={`min-h-0 flex-1 relative flex flex-col no-scrollbar ${fullHeight ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
                <div className={`mx-auto w-full min-h-0 animate-in fade-in duration-500 ${fullHeight ? 'flex flex-1 flex-col p-4 lg:p-6' : 'max-w-[1600px] p-5 lg:p-8'}`}>
                  {children}
                </div>
              </main>
            </div>
          </div>
          <AIStatusIndicator />
        </PageHeaderPortalContext.Provider>
      </SidebarProvider>
    </PageInfoProvider>
  );
}
