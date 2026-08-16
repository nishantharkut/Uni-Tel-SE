import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/services/notificationService';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
  action_text?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await NotificationService.getNotifications();
      if (result.success) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // In production, you'd set up real-time subscriptions for notifications
    // For now, we'll only load notifications on mount and when explicitly created
    // No automatic random notifications - they should be contextually relevant
    return () => {};
  };

  const markAsRead = async (notificationId: string) => {
    const result = await NotificationService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    const result = await NotificationService.markAllAsRead();
    if (result.success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const result = await NotificationService.deleteNotification(notificationId);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const result = await NotificationService.createNotification(notification);
    if (result.success) {
      setNotifications(prev => [result.notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default'
      });
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };
}
