import { useCallback, useState } from 'react';

import { getStoredUserPricingInfo } from '../../../services/storage/userPricingStorage';
import { getErrorMessage } from '../../../services/api/errors';
import { navigateToCartTab } from '../../../app/navigation/shoppingNavigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { BellNotification } from '../types';
import { addNotificationOfferToCart } from '../utils/notificationOfferCart';

type BellNotificationsNavigation = NativeStackNavigationProp<
  ShoppingStackParamList,
  'BellNotifications'
>;

interface UseNotificationOfferActionsOptions {
  userId?: string;
  navigation: BellNotificationsNavigation;
  markAsRead: (notificationId: string) => Promise<void>;
}

export function useNotificationOfferActions({
  userId,
  navigation,
  markAsRead,
}: UseNotificationOfferActionsOptions) {
  const [addingNotificationId, setAddingNotificationId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const addOfferToCart = useCallback(
    async (notification: BellNotification) => {
      if (!notification.product?.id) {
        return;
      }

      setAddingNotificationId(notification._id);
      setActionError(null);

      try {
        await markAsRead(notification._id);

        const userInfo = (await getStoredUserPricingInfo()) ?? { country: 'CA' };
        await addNotificationOfferToCart(notification, userId, userInfo);
        navigateToCartTab(navigation);
      } catch (caught) {
        setActionError(getErrorMessage(caught, 'Could not add this offer to your cart'));
      } finally {
        setAddingNotificationId(null);
      }
    },
    [markAsRead, navigation, userId],
  );

  return {
    addingNotificationId,
    actionError,
    addOfferToCart,
    clearActionError: () => setActionError(null),
  };
}
