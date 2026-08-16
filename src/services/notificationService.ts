import { supabase } from '@/integrations/supabase/client';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationData {
  id?: string;
  title: string;
  message: string;
  type: NotificationType;
  action_url?: string;
  action_text?: string;
  user_id?: string;
  expires_at?: string;
}

export interface StoredNotification extends NotificationData {
  id: string;
  read: boolean;
  created_at: string;
  source?: 'manual' | 'academic-alert';
}

const STORAGE_PREFIX = 'uni-tel:notifications';
const MAX_NOTIFICATIONS = 60;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function resolveUserId(userId?: string): Promise<string> {
  if (userId) return userId;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? 'local';
  } catch {
    return 'local';
  }
}

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

function normaliseStoredNotification(value: unknown): StoredNotification | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Partial<StoredNotification>;
  if (!entry.title || !entry.message || !entry.type) return null;

  return {
    id: String(entry.id ?? `${Date.now()}-${Math.random()}`),
    title: String(entry.title),
    message: String(entry.message),
    type: entry.type,
    action_url: entry.action_url,
    action_text: entry.action_text,
    user_id: entry.user_id,
    expires_at: entry.expires_at,
    read: Boolean(entry.read),
    created_at: String(entry.created_at ?? new Date().toISOString()),
    source: entry.source,
  };
}

function readNotifications(userId: string): StoredNotification[] {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normaliseStoredNotification)
      .filter((entry): entry is StoredNotification => Boolean(entry));
  } catch {
    return [];
  }
}

function writeNotifications(userId: string, notifications: StoredNotification[]) {
  const sorted = [...notifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(sorted));
}

function isExpired(notification: StoredNotification, now = new Date()): boolean {
  return Boolean(notification.expires_at && new Date(notification.expires_at) < now);
}

function createStoredNotification(data: NotificationData, userId: string, source: StoredNotification['source'] = 'manual'): StoredNotification {
  return {
    ...data,
    id: data.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    user_id: data.user_id || userId,
    read: false,
    created_at: new Date().toISOString(),
    source,
  };
}

export class NotificationService {
  static async createNotification(data: NotificationData, userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const existingNotifications = readNotifications(resolvedUserId).filter((notification) => !isExpired(notification));
      const existingById = data.id
        ? existingNotifications.some((notification) => notification.id === data.id)
        : false;

      const oneDayAgo = new Date(Date.now() - ONE_DAY_MS);
      const isDuplicate = existingNotifications.some((notification) => {
        const createdAt = new Date(notification.created_at);
        return notification.title === data.title
          && notification.message === data.message
          && createdAt > oneDayAgo;
      });

      if (existingById || isDuplicate) {
        return { success: false, error: 'Duplicate notification prevented' };
      }

      const notification = createStoredNotification(data, resolvedUserId);
      writeNotifications(resolvedUserId, [notification, ...existingNotifications]);
      return { success: true, notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }
  }

  static async syncAcademicNotifications(generatedNotifications: NotificationData[], userId?: string) {
    const resolvedUserId = await resolveUserId(userId);
    const existingNotifications = readNotifications(resolvedUserId).filter((notification) => !isExpired(notification));
    const generatedIds = new Set(generatedNotifications.map((notification) => notification.id).filter(Boolean));
    const nextNotifications = existingNotifications.filter(
      (notification) => notification.source !== 'academic-alert' || generatedIds.has(notification.id)
    );

    generatedNotifications.forEach((generated) => {
      const existing = nextNotifications.find((notification) => notification.id === generated.id);
      if (existing) {
        Object.assign(existing, {
          ...generated,
          read: existing.read,
          created_at: existing.created_at,
          source: 'academic-alert' as const,
          user_id: resolvedUserId,
        });
        return;
      }

      nextNotifications.unshift(createStoredNotification(generated, resolvedUserId, 'academic-alert'));
    });

    writeNotifications(resolvedUserId, nextNotifications);
    return { success: true, notifications: readNotifications(resolvedUserId) };
  }

  static async getNotifications(userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const notifications = readNotifications(resolvedUserId);
      const validNotifications = notifications.filter((notification) => !isExpired(notification));

      if (validNotifications.length !== notifications.length) {
        writeNotifications(resolvedUserId, validNotifications);
      }

      return { success: true, notifications: validNotifications };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error, notifications: [] };
    }
  }

  static async markAsRead(notificationId: string, userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const notifications = readNotifications(resolvedUserId);
      const updatedNotifications = notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );

      writeNotifications(resolvedUserId, updatedNotifications);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }

  static async deleteNotification(notificationId: string, userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const filteredNotifications = readNotifications(resolvedUserId).filter(
        (notification) => notification.id !== notificationId
      );

      writeNotifications(resolvedUserId, filteredNotifications);
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error };
    }
  }

  static async markAllAsRead(userId?: string) {
    try {
      const resolvedUserId = await resolveUserId(userId);
      const updatedNotifications = readNotifications(resolvedUserId).map((notification) => ({
        ...notification,
        read: true,
      }));

      writeNotifications(resolvedUserId, updatedNotifications);
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  }

  static async createWelcomeNotification() {
    return this.createNotification({
      title: 'Welcome to UNI-TEL',
      message: 'Your academic dashboard is ready. Start by adding your first semester.',
      type: 'info',
      action_url: '/semesters',
      action_text: 'Add semester',
    });
  }

  static async createAttendanceReminder() {
    return this.createNotification({
      title: 'Attendance reminder',
      message: 'Update attendance after today’s classes to keep risk planning accurate.',
      type: 'warning',
      action_url: '/attendance',
      action_text: 'Open attendance',
    });
  }

  static async createExamResultNotification(subjectName: string) {
    return this.createNotification({
      title: 'Exam results available',
      message: `${subjectName} marks are available. Review the target plan if needed.`,
      type: 'success',
      action_url: '/marks',
      action_text: 'View marks',
    });
  }

  static async createLowAttendanceAlert(subjectName: string, percentage: number) {
    return this.createNotification({
      title: 'Low attendance alert',
      message: `${subjectName} attendance is ${percentage.toFixed(1)}%. Review recovery requirements.`,
      type: 'warning',
      action_url: '/attendance',
      action_text: 'Check attendance',
    });
  }

  static async createFeatureUpdateNotification() {
    return this.createNotification({
      title: 'Marks planning available',
      message: 'Custom exam types and weightage planning are available in the Marks section.',
      type: 'info',
      action_url: '/marks',
      action_text: 'Open marks',
    });
  }
}
