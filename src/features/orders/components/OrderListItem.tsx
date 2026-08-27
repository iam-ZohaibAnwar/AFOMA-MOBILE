import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppBadge } from '../../../components/ui/AppBadge';
import { AppText } from '../../../components/ui/AppText';
import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { colors, radius, spacing } from '../../../design-system';
import type { OrderSummary } from '../../../services/types/order';
import { formatOrderDisplayId, formatOrderTotal } from '../utils/orderDisplay';
import {
  getOrderListAccessibilityLabel,
  getOrderListPrimaryTitle,
  getOrderListStatusBadgeVariant,
  getOrderListStatusLabel,
  getOrderListSubtitle,
  getOrderListThumbnailUrl,
} from '../utils/orderListDisplay';

interface OrderListItemProps {
  order: OrderSummary;
  onPress: (orderId: string) => void;
}

export function OrderListItem({ order, onPress }: OrderListItemProps) {
  const orderId = order._id;
  const thumbnailUrl = getOrderListThumbnailUrl(order);
  const [imageFailed, setImageFailed] = useState(false);
  const showThumbnail = Boolean(thumbnailUrl) && !imageFailed;

  const statusLabel = getOrderListStatusLabel(order.status);
  const statusVariant = getOrderListStatusBadgeVariant(order.status);
  const subtitle = getOrderListSubtitle(order);
  const accessibilityLabel = getOrderListAccessibilityLabel(order);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={!orderId}
      onPress={() => {
        if (orderId) {
          onPress(orderId);
        }
      }}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.thumbnailWrap}>
        {showThumbnail ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Ionicons name="bag-outline" size={22} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <AppText variant="bodyMedium" style={styles.primaryTitle} numberOfLines={2}>
          {getOrderListPrimaryTitle(order)}
        </AppText>

        <View style={styles.statusRow}>
          <AppBadge label={statusLabel} variant={statusVariant} />
        </View>

        {subtitle ? (
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}

        <View style={styles.footerRow}>
          <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.orderId}>
            Order {formatOrderDisplayId(orderId)}
          </AppText>
          <View style={styles.totalRow}>
            <AppText variant="bodyMedium" style={styles.total}>
              {formatOrderTotal(order)}
            </AppText>
            <ChevronForwardIcon color={colors.textMuted} size={18} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const THUMBNAIL_SIZE = 64;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.88,
  },
  thumbnailWrap: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  primaryTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statusRow: {
    alignSelf: 'flex-start',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  orderId: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  total: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
