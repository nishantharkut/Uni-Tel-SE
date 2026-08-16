import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicSummary, useAttendance, useMarks, useSubjects } from '@/hooks/useAcademic';
import {
  NotificationService,
  type StoredNotification,
} from '@/services/notificationService';
import { buildAcademicNotifications } from '@/services/academicNotificationRules';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export interface Notification extends StoredNotification {}

function countUnread(notifications: Notification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { preferences } = useUserPreferences();
  const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
  const { data: marks = [], isLoading: marksLoading } = useMarks();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: summary, isLoading: summaryLoading } = useAcademicSummary();

  const updateNotificationState = useCallback((nextNotifications: Notification[]) => {
    setNotifications(nextNotifications);
    setUnreadCount(countUnread(nextNotifications));
  }, []);

  const loadNotifications = useCallback(async () => {
    if (authLoading) return;

    try {
      const result = await NotificationService.getNotifications(user?.id);
      if (result.success) {
        updateNotificationState(result.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [authLoading, updateNotificationState, user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const academicDataLoading = attendanceLoading || marksLoading || subjectsLoading || summaryLoading;
    if (authLoading || academicDataLoading) return;

    const generatedNotifications = buildAcademicNotifications({
      attendance,
      marks,
      subjects,
      summary,
      preferences,
    });

    NotificationService.syncAcademicNotifications(generatedNotifications, user?.id)
      .then((result) => {
        if (result.success) {
          updateNotificationState(result.notifications);
        }
      })
      .catch((error) => {
        console.error('Error syncing academic notifications:', error);
      })
      .finally(() => setLoading(false));
  }, [
    attendance,
    attendanceLoading,
    authLoading,
    marks,
    marksLoading,
    preferences,
    subjects,
    subjectsLoading,
    summary,
    summaryLoading,
    updateNotificationState,
    user?.id,
  ]);

  const markAsRead = async (notificationId: string) => {
    const result = await NotificationService.markAsRead(notificationId, user?.id);
    if (result.success) {
      setNotifications((current) => {
        const next = current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        );
        setUnreadCount(countUnread(next));
        return next;
      });
    }
  };

  const markAllAsRead = async () => {
    const result = await NotificationService.markAllAsRead(user?.id);
    if (result.success) {
      setNotifications((current) => {
        const next = current.map((notification) => ({ ...notification, read: true }));
        setUnreadCount(0);
        return next;
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const result = await NotificationService.deleteNotification(notificationId, user?.id);
    if (result.success) {
      setNotifications((current) => {
        const next = current.filter((notification) => notification.id !== notificationId);
        setUnreadCount(countUnread(next));
        return next;
      });
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const result = await NotificationService.createNotification(notification, user?.id);
    if (result.success && result.notification) {
      setNotifications((current) => {
        const next = [result.notification, ...current];
        setUnreadCount(countUnread(next));
        return next;
      });

      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
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
    createNotification,
  };
}
