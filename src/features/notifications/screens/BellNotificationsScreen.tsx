import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { colors, spacing } from '../../../design-system';
import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { BellNotificationCard } from '../components/BellNotificationCard';
import { useBellNotifications } from '../hooks/useBellNotifications';
import { useNotificationOfferActions } from '../hooks/useNotificationOfferActions';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'BellNotifications'>;

const RETURN_TO = authReturnTo.bellNotifications();

export function BellNotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { isAuthorized } = useRequireAuth(RETURN_TO);
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);

  const {
    notifications,
    unreadCount,
    isRefreshing,
    error,
    refresh,
    markAsRead,
    removeNotification,
  } = useBellNotifications({
    userId: isAuthorized ? userId : undefined,
    enabled: isAuthorized,
  });

  const {
    addingNotificationId,
    actionError,
    addOfferToCart,
    clearActionError,
  } = useNotificationOfferActions({
    userId,
    navigation,
    markAsRead,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        notifications.length === 0 && styles.emptyContent,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
      data={notifications}
      keyExtractor={(item) => item._id}
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
      refreshing={isRefreshing && notifications.length > 0}
      onRefresh={() => void refresh()}
      ListHeaderComponent={
        <View style={styles.header}>
          <AppText variant="bodyMedium" color="textSecondary">
            Offers, coupons, and seller promotions appear here.
          </AppText>
          {unreadCount > 0 ? (
            <AppText variant="caption" color="primary" style={styles.unreadBadge}>
              {unreadCount} unread
            </AppText>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !isRefreshing ? (
          <View style={styles.emptyState}>
            <AppText variant="h3">No notifications yet</AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.emptyCopy}>
              We&apos;ll notify you when a seller sends an offer or a promotion is available.
            </AppText>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <BellNotificationCard
          notification={item}
          isAddingToCart={addingNotificationId === item._id}
          onMarkAsRead={(notificationId) => void markAsRead(notificationId)}
          onDelete={(notificationId) => void removeNotification(notificationId)}
          onAddToCart={item.product?.id ? (notification) => void addOfferToCart(notification) : undefined}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={
        error || actionError ? (
          <ErrorState
            message={actionError ?? error ?? 'Something went wrong'}
            onAction={() => {
              clearActionError();
              void refresh();
            }}
            style={styles.error}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  unreadBadge: {
    alignSelf: 'flex-start',
    fontWeight: '700',
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyCopy: {
    textAlign: 'center',
  },
  error: {
    marginTop: spacing.lg,
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
