import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import type { OrderSummary } from '../../../services/types/order';
import { formatOrderDateShort, formatOrderDisplayId, formatOrderTotal } from '../utils/orderDisplay';
import {
  getOrderListAccessibilityLabel,
  getOrderListPreviewImages,
  getOrderListStatusBadgeVariant,
  getOrderListStatusLabel,
} from '../utils/orderListDisplay';

interface OrderListItemProps {
  order: OrderSummary;
  onPress: (orderId: string) => void;
}

function getStatusIconName(status?: string): keyof typeof Ionicons.glyphMap {
  const normalized = status?.trim() ?? '';

  if (normalized === 'Delivered') {
    return 'checkmark-circle';
  }

  if (
    normalized === 'Shipped' ||
    normalized === 'Dispatch' ||
    normalized === 'Dispatched' ||
    normalized === 'OutforDelivery'
  ) {
    return 'car-outline';
  }

  if (normalized === 'Processing') {
    return 'checkmark-circle-outline';
  }

  if (normalized === 'Pending') {
    return 'time-outline';
  }

  if (normalized === 'Cancelled' || normalized === 'Cancel order') {
    return 'close-circle-outline';
  }

  return 'ellipse-outline';
}

function getStatusColor(status?: string): string {
  const variant = getOrderListStatusBadgeVariant(status);
  if (variant === 'success') {
    return colors.success;
  }
  if (variant === 'warning') {
    return colors.warningText;
  }
  return colors.textSecondary;
}

function OrderPreviewThumbnail({
  uri,
  label,
  isOverflow,
}: {
  uri?: string;
  label?: string;
  isOverflow?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(uri) && !imageFailed && !isOverflow;

  return (
    <View style={[styles.thumbnail, isOverflow && styles.thumbnailOverflow]}>
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.thumbnailImage}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : isOverflow ? (
        <AppText variant="caption" style={styles.overflowLabel}>
          {label}
        </AppText>
      ) : (
        <Ionicons name="bag-outline" size={18} color={colors.textMuted} />
      )}
    </View>
  );
}

export function OrderListItem({ order, onPress }: OrderListItemProps) {
  const orderId = order._id;
  const { images, overflowCount } = getOrderListPreviewImages(order);
  const statusLabel = getOrderListStatusLabel(order.status);
  const statusColor = getStatusColor(order.status);
  const accessibilityLabel = getOrderListAccessibilityLabel(order);
  const previewSlots =
    images.length > 0
      ? [
          ...images.map((uri) => ({ uri, isOverflow: false as const })),
          ...(overflowCount > 0 ? [{ isOverflow: true as const, label: `+${overflowCount}` }] : []),
        ]
      : [{ isOverflow: false as const, uri: undefined }];

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
      <View style={styles.headerRow}>
        <View style={styles.headerMeta}>
          <AppText variant="caption" color="textMuted" style={styles.orderLabel}>
            ORDER #{formatOrderDisplayId(orderId)}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {formatOrderDateShort(order.createdAt)}
          </AppText>
        </View>

        <View style={styles.statusWrap}>
          <Ionicons name={getStatusIconName(order.status)} size={14} color={statusColor} />
          <AppText variant="bodySmall" style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </AppText>
        </View>
      </View>

      <View
        style={styles.previewRow}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {previewSlots.map((slot, index) => (
          <OrderPreviewThumbnail
            key={`${orderId ?? 'order'}-preview-${index}`}
            uri={'uri' in slot ? slot.uri : undefined}
            label={'label' in slot ? slot.label : undefined}
            isOverflow={slot.isOverflow}
          />
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.totalBlock}>
          <AppText variant="caption" color="textMuted" style={styles.totalLabel}>
            TOTAL AMOUNT
          </AppText>
          <AppText variant="h3" style={styles.totalValue}>
            {formatOrderTotal(order)}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          disabled={!orderId}
          onPress={() => {
            if (orderId) {
              onPress(orderId);
            }
          }}
          style={({ pressed }) => [styles.viewButton, pressed && styles.viewButtonPressed]}
        >
          <AppText variant="bodySmall" style={styles.viewButtonLabel}>
            View Order
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const THUMBNAIL_SIZE = 52;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  orderLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  statusLabel: {
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverflow: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  overflowLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalBlock: {
    flex: 1,
    gap: 2,
  },
  totalLabel: {
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  totalValue: {
    color: colors.primary,
    fontWeight: '800',
  },
  viewButton: {
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  viewButtonLabel: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
