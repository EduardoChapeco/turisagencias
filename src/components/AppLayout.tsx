import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useAuthStore } from '@/stores/authStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: 'var(--vj-bg, #f7f7f5)' }}>
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header — 50px, blur, neutro */}
          <header
            className="flex h-[50px] items-center gap-3 px-4 shrink-0"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 90,
              background: 'rgba(247,247,245,0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid #e5e4e0',
            }}
          >
            <SidebarTrigger className="h-8 w-8" />

            <div className="ml-auto flex items-center gap-3">
              <NotificationPanel />
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: '#f0faf4', border: '1px solid rgba(26,122,74,.2)', color: '#1a7a4a' }}
              >
                {(profile?.first_name?.[0] || '?').toUpperCase()}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none" style={{ color: '#111110' }}>
                  {profile?.first_name || 'Usuário'}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#9b9a96' }}>
                  {profile?.email || ''}
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-5">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
