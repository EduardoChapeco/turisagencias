import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useAuthStore } from '@/stores/authStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <h1 className="font-heading text-lg font-semibold text-foreground">VoyageOS</h1>
            <div className="ml-auto flex items-center gap-3">
              <NotificationPanel />
              <div className="text-right">
                <p className="text-sm font-medium">{profile?.first_name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground">{profile?.email || 'Sem e-mail'}</p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
