import { useEffect, useRef } from 'react';

import { useAuth } from '../../features/auth/hooks/useAuth';
import { resolveChatUserId } from '../../features/chat/utils/resolveChatUserId';
import { notifyBellNotificationsRefresh } from '../../features/notifications/utils/notificationRefresh';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  extractPushNotificationData,
  getInitialNotificationResponse,
  syncDevicePushRegistration,
} from './pushNotifications';
import {
  navigateToBellNotificationsFromPush,
  navigateToChatFromPush,
  navigateToChatListFromPush,
} from './pushNavigation';

function handleNotificationOpen(data: {
  type?: string;
  chatId?: string;
  senderId?: string;
  notificationId?: string;
}) {
  if (data.type === 'marketplace_offer') {
    navigateToBellNotificationsFromPush();
    return;
  }

  if (data.chatId || data.senderId) {
    navigateToChatFromPush(data.chatId, data.senderId);
    return;
  }

  navigateToChatListFromPush();
}

export function PushNotificationBootstrap() {
  const { isAuthenticated, user } = useAuth();
  const chatUserId = resolveChatUserId(user);
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !chatUserId) {
      registeredTokenRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const token = await syncDevicePushRegistration(chatUserId);
        if (!cancelled) {
          registeredTokenRef.current = token;
        }
      } catch (error) {
        console.warn('Push registration failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatUserId, isAuthenticated]);

  useEffect(() => {
    void (async () => {
      const initial = await getInitialNotificationResponse();
      if (!initial) {
        return;
      }

      handleNotificationOpen(extractPushNotificationData(initial));
    })();
  }, []);

  useEffect(() => {
    const openSubscription = addNotificationResponseListener((response) => {
      handleNotificationOpen(extractPushNotificationData(response));
    });

    const receiveSubscription = addNotificationReceivedListener((notification) => {
      const data = extractPushNotificationData(notification);
      if (data.type === 'marketplace_offer') {
        notifyBellNotificationsRefresh();
      }
    });

    return () => {
      openSubscription.remove();
      receiveSubscription.remove();
    };
  }, []);

  return null;
}
