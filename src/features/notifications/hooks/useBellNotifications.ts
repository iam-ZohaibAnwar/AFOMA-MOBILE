import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  deleteNotificationById,
  getNotificationsByUserId,
  markNotificationRead,
} from '../../../services/api/notificationsApi';
import {
  getBellNotificationsCache,
  setBellNotificationsCache,
} from '../../../services/cache/screenCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { BellNotification } from '../types';
import {
  notifyBellNotificationsRefresh,
  subscribeBellNotificationsRefresh,
} from '../utils/notificationRefresh';

interface UseBellNotificationsOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseBellNotificationsResult {
  notifications: BellNotification[];
  unreadCount: number;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
}

export function useBellNotifications({
  userId,
  enabled = true,
}: UseBellNotificationsOptions): UseBellNotificationsResult {
  const cached = userId ? getBellNotificationsCache(userId) : undefined;
  const [notifications, setNotifications] = useState<BellNotification[]>(cached ?? []);
  const [isRefreshing, setIsRefreshing] = useState(enabled && Boolean(userId) && !cached?.length);
  const [error, setError] = useState<string | null>(null);
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const refresh = useCallback(async () => {
    if (!enabled || !userId) {
      setNotifications([]);
      setIsRefreshing(false);
      return;
    }

    const hasExisting = notificationsRef.current.length > 0;
    if (!hasExisting) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const nextNotifications = await getNotificationsByUserId(userId);
      setNotifications(nextNotifications);
      setBellNotificationsCache(userId, nextNotifications);
      notifyBellNotificationsRefresh('cache');
    } catch (caught) {
      if (!hasExisting) {
        setNotifications([]);
      }
      setError(getErrorMessage(caught, 'Failed to load notifications'));
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    if (!enabled || !userId) {
      setNotifications([]);
      setIsRefreshing(false);
      return;
    }

    const cachedNotifications = getBellNotificationsCache(userId);
    if (cachedNotifications) {
      setNotifications(cachedNotifications);
      setIsRefreshing(false);
    }

    void refresh();
  }, [enabled, refresh, userId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return subscribeBellNotificationsRefresh((mode) => {
      if (mode === 'cache' && userId) {
        const cachedNotifications = getBellNotificationsCache(userId);
        if (cachedNotifications) {
          setNotifications(cachedNotifications);
          return;
        }
      }

      void refresh();
    });
  }, [enabled, refresh, userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setNotifications((current) => {
        const next = current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        );

        if (userId) {
          setBellNotificationsCache(userId, next);
        }

        notifyBellNotificationsRefresh('cache');

        return next;
      });

      try {
        await markNotificationRead(notificationId);
      } catch (caught) {
        setError(getErrorMessage(caught, 'Failed to mark notification as read'));
        void refresh();
      }
    },
    [refresh, userId],
  );

  const removeNotification = useCallback(
    async (notificationId: string) => {
      setNotifications((current) => {
        const next = current.filter((notification) => notification._id !== notificationId);

        if (userId) {
          setBellNotificationsCache(userId, next);
        }

        notifyBellNotificationsRefresh('cache');

        return next;
      });

      try {
        await deleteNotificationById(notificationId);
      } catch (caught) {
        setError(getErrorMessage(caught, 'Failed to delete notification'));
        void refresh();
      }
    },
    [refresh, userId],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    isRefreshing,
    error,
    refresh,
    markAsRead,
    removeNotification,
  };
}
