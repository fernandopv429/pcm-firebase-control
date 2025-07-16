import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  empresaId: string;
}

export const NotificationSystem = ({ empresaId }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simular notificações do sistema
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: 'warning',
        title: "Manutenção Preventiva Pendente",
        description: "5 equipamentos estão com manutenção preventiva vencida",
        timestamp: new Date(),
        read: false
      },
      {
        id: "2",
        type: 'error',
        title: "Equipamento Crítico",
        description: "Equipamento EQ-001 apresentou falha crítica",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: false
      },
      {
        id: "3",
        type: 'info',
        title: "Relatório Disponível",
        description: "Relatório mensal de manutenção foi gerado",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true
      }
    ];

    setNotifications(sampleNotifications);
  }, [empresaId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'success': return 'default';
      default: return 'default';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="shadow-elevated"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="ml-1 bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      <div className="flex items-center justify-between bg-card/95 backdrop-blur-sm rounded-lg p-2 border shadow-elevated">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-medium">Notificações</span>
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
        >
          <BellOff className="h-4 w-4" />
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Alert className="bg-card/95 backdrop-blur-sm">
          <AlertDescription>
            Nenhuma notificação no momento
          </AlertDescription>
        </Alert>
      ) : (
        notifications.slice(0, 3).map((notification) => (
          <Alert
            key={notification.id}
            variant={getAlertVariant(notification.type)}
            className={`bg-card/95 backdrop-blur-sm ${
              !notification.read ? 'border-primary' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <AlertTitle className="text-sm font-medium">
                  {notification.title}
                </AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  {notification.description}
                </AlertDescription>
                <div className="text-xs text-muted-foreground mt-1">
                  {notification.timestamp.toLocaleTimeString('pt-BR')}
                </div>
              </div>
              <div className="flex gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    className="h-6 w-6 p-0"
                  >
                    <span className="sr-only">Marcar como lida</span>
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Alert>
        ))
      )}
    </div>
  );
};