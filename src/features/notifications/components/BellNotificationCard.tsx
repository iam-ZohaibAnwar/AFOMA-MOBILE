import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { BellNotification } from '../types';
import { formatNotificationTimestamp } from '../utils/formatNotificationTimestamp';
import {
  getNotificationOfferLabel,
  getNotificationTitle,
} from '../utils/notificationOfferCart';

interface BellNotificationCardProps {
  notification: BellNotification;
  isAddingToCart?: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onAddToCart?: (notification: BellNotification) => void;
}

export function BellNotificationCard({
  notification,
  isAddingToCart = false,
  onMarkAsRead,
  onDelete,
  onAddToCart,
}: BellNotificationCardProps) {
  const isUnread = !notification.isRead;
  const imageUri = notification.product?.image?.trim();

  return (
    <View style={[styles.card, isUnread && styles.cardUnread]}>
      <View style={styles.contentRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppText variant="bodyMedium">🎁</AppText>
          </View>
        )}

        <View style={styles.textBlock}>
          <AppText variant="bodyMedium" style={isUnread ? styles.titleUnread : styles.title}>
            {getNotificationTitle(notification)}
          </AppText>
          <AppText variant="caption" color="textSecondary" style={styles.offer}>
            {getNotificationOfferLabel(notification)}
          </AppText>
          <AppText variant="caption" color="textMuted" style={styles.timestamp}>
            {formatNotificationTimestamp(notification.createdAt)}
          </AppText>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <AppButton
          label={isUnread ? 'Mark as read' : 'Read'}
          variant="primary"
          disabled={!isUnread}
          onPress={() => onMarkAsRead(notification._id)}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete notification"
          onPress={() => onDelete(notification._id)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>
      </View>

      {notification.product?.id && onAddToCart ? (
        <AppButton
          label={isAddingToCart ? 'Adding…' : 'Add to cart'}
          variant="outline"
          loading={isAddingToCart}
          onPress={() => onAddToCart(notification)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  contentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  imagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  titleUnread: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  offer: {
    lineHeight: 18,
  },
  timestamp: {
    marginTop: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
