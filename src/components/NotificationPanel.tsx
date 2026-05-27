import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useMarkNotificationAsRead, useNotifications } from '@/hooks/useNotifications';

export function NotificationPanel() {
 const { data: notifications } = useNotifications();
 const markAsRead = useMarkNotificationAsRead();
 const unreadCount = notifications?.filter((item) => !item.read_at).length ?? 0;

 return (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="relative">
 <Bell className="h-4 w-4" />
 {unreadCount > 0 && (
 <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
 {unreadCount}
 </span>
 )}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-80">
 <DropdownMenuLabel>Notificações</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <ScrollArea className="h-80">
 <div className="space-y-2 p-2">
 {!notifications?.length && (
 <p className="px-2 py-4 text-sm text-muted-foreground">
 Nenhuma notificação por enquanto.
 </p>
 )}

 {notifications?.map((notification) => (
 <button
 key={notification.id}
 type="button"
 onClick={() => {
 if (!notification.read_at) {
 markAsRead.mutate(notification.id);
 }
 }}
 className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1">
 <p className="text-sm font-medium">{notification.title}</p>
 {notification.message && (
 <p className="text-xs text-muted-foreground">{notification.message}</p>
 )}
 <p className="text-[11px] text-muted-foreground">
 {new Date(notification.created_at).toLocaleString('pt-BR')}
 </p>
 </div>
 {!notification.read_at && <Badge variant="secondary">Nova</Badge>}
 </div>
 </button>
 ))}
 </div>
 </ScrollArea>
 </DropdownMenuContent>
 </DropdownMenu>
 );
}
