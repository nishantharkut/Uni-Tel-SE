import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_text?: string;
  user_id?: string;
  expires_at?: string;
}

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(data: NotificationData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const notification = {
        ...data,
        user_id: data.user_id || user.id,
        read: false,
        created_at: new Date().toISOString()
      };

      // In production, you'd save to a notifications table
      // For now, we'll use localStorage for persistence
      const existingNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );

      // Prevent duplicate notifications (same title and message within last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const isDuplicate = existingNotifications.some((n: any) => {
        const createdAt = new Date(n.created_at);
        return n.title === notification.title && 
               n.message === notification.message &&
               createdAt > oneDayAgo;
      });

      if (isDuplicate) {
        return { success: false, error: 'Duplicate notification prevented' };
      }
      
      const newNotification = {
        id: Date.now().toString(),
        ...notification
      };
      
      existingNotifications.unshift(newNotification);
      
      // Keep only the most recent 50 notifications to prevent localStorage bloat
      const trimmedNotifications = existingNotifications.slice(0, 50);
      localStorage.setItem('notifications', JSON.stringify(trimmedNotifications));

      return { success: true, notification: newNotification };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Get notifications for the current user
   */
  static async getNotifications(userId?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // In production, you'd fetch from database
      const notifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );

      // Filter out expired notifications and only return relevant ones
      const now = new Date();
      const validNotifications = notifications.filter((n: any) => {
        // Remove expired notifications
        if (n.expires_at && new Date(n.expires_at) < now) {
          return false;
        }
        return true;
      });

      // Update localStorage to remove expired notifications
      if (validNotifications.length !== notifications.length) {
        localStorage.setItem('notifications', JSON.stringify(validNotifications));
      }

      return { success: true, notifications: validNotifications };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      const notifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      
      const updatedNotifications = notifications.map((n: any) => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string) {
    try {
      const notifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      
      const filteredNotifications = notifications.filter(
        (n: any) => n.id !== notificationId
      );
      
      localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead() {
    try {
      const notifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      );
      
      const updatedNotifications = notifications.map((n: any) => ({
        ...n,
        read: true
      }));
      
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  }

  /**
   * Create system notifications for common events
   */
  static async createWelcomeNotification() {
    return this.createNotification({
      title: 'Welcome to UNI-TEL!',
      message: 'Your academic dashboard is ready. Start by adding your first semester.',
      type: 'info',
      action_url: '/semesters',
      action_text: 'Add Semester'
    });
  }

  static async createAttendanceReminder() {
    return this.createNotification({
      title: 'Attendance Reminder',
      message: 'You have classes today. Don\'t forget to mark your attendance.',
      type: 'warning',
      action_url: '/attendance',
      action_text: 'Mark Attendance'
    });
  }

  static async createExamResultNotification(subjectName: string) {
    return this.createNotification({
      title: 'Exam Results Available',
      message: `Your ${subjectName} exam results are now available. Check your marks.`,
      type: 'success',
      action_url: '/marks',
      action_text: 'View Marks'
    });
  }

  static async createLowAttendanceAlert(subjectName: string, percentage: number) {
    return this.createNotification({
      title: 'Low Attendance Alert',
      message: `Your attendance in ${subjectName} is ${percentage}%. Consider improving it.`,
      type: 'warning',
      action_url: '/attendance',
      action_text: 'Check Attendance'
    });
  }

  static async createFeatureUpdateNotification() {
    return this.createNotification({
      title: 'New Feature Available',
      message: 'Custom exam types and weightages are now available in the Marks section.',
      type: 'info',
      action_url: '/marks',
      action_text: 'Try It Out'
    });
  }
}
