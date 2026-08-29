import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import {
  formatOrderDateShort,
  formatOrderDisplayId,
  formatOrderTotal,
} from '../../../orders/utils/orderDisplay';
import {
  getOrderListPreviewImages,
} from '../../../orders/utils/orderListDisplay';
import {
  getOrderStatusColor,
  getOrderStatusIconName,
} from '../../../orders/utils/orderDetailDisplay';
import type { AdminOrderListItem } from '../types/adminOrderManagement';
import {
  formatAdminOrderStatus,
  getAdminOrderCustomerName,
  getAdminOrderSellerName,
} from '../utils/adminOrderDisplay';

export interface AdminOrderCardProps {
  order: AdminOrderListItem;
  onPress: (order: AdminOrderListItem) => void;
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
        <Ionicons name="bag-outline" size={18} color={colors.textInverse} />
      )}
    </View>
  );
}

export function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  const orderId = order._id;
  const { images, overflowCount } = getOrderListPreviewImages(order);
  const statusLabel = formatAdminOrderStatus(order.status);
  const statusColor = getOrderStatusColor(order.status);
  const customerName = getAdminOrderCustomerName(order);
  const sellerName = getAdminOrderSellerName(order);
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
      accessibilityLabel={`View order ${formatOrderDisplayId(orderId)}`}
      disabled={!orderId}
      onPress={() => onPress(order)}
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
          <Ionicons name={getOrderStatusIconName(order.status)} size={14} color={statusColor} />
          <AppText variant="bodySmall" style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel}
          </AppText>
        </View>
      </View>

      <View style={styles.partyBlock}>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
          Customer: {customerName}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
          Seller: {sellerName}
        </AppText>
      </View>

      <View style={styles.previewRow}>
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
          accessibilityLabel={`View order ${formatOrderDisplayId(orderId)}`}
          disabled={!orderId}
          onPress={() => onPress(order)}
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
  partyBlock: {
    gap: 2,
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
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailOverflow: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  overflowLabel: {
    color: colors.textInverse,
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
