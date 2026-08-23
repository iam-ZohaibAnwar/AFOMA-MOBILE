import { useState } from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { CartLineItem } from '../../../../services/types/cart';
import { getProductDisplayName, getProductImageUrl } from '../../../products/utils/productDisplay';
import {
  formatLineVariations,
  formatSellerDisplayId,
  formatSellerDisplayName,
  getDownloadableProductUrl,
  isDownloadableLine,
} from '../../../orders/utils/orderDisplay';
import {
  calculateOrderItemLineTotal,
  calculateOrderItemUnitPrice,
  formatOrderMoney,
} from '../../../orders/utils/orderPricing';
import type { AdminOrderDetail } from '../types/adminOrderManagement';
import {
  formatAdminLineFulfillmentStatus,
  formatAdminPaymentStatus,
} from '../utils/adminOrderDetailDisplay';
import {
  buildAdminLineFulfillmentOptions,
  canUpdateAdminLineFulfillment,
  isDestructiveAdminLineFulfillment,
} from '../utils/adminOrderOperations';
import { orderStatusBadgeVariant } from '../utils/adminOrderDisplay';

export interface AdminOrderLineItemProps {
  order: AdminOrderDetail;
  line: CartLineItem;
  isUpdatingFulfillment?: boolean;
  onFulfillmentStatusChange?: (productId: string, shippingStatus: string) => void;
}

function getLineImageUrl(line: CartLineItem): string | undefined {
  const product = line.productData;
  if (!product) {
    return undefined;
  }

  if (
    product.productType === 'Customizable' &&
    product.variations?.length &&
    line.selectedVariations?.length
  ) {
    const selected = line.selectedVariations[0];
    const match = product.variations.find(
      (variation) =>
        (variation as Record<string, unknown>)[selected.attributeName ?? ''] ===
        selected.attributeValue,
    );
    const variationImage = match?.image;
    if (typeof variationImage === 'string' && variationImage) {
      return variationImage;
    }
    if (variationImage && typeof variationImage === 'object' && variationImage.imageUrl) {
      return variationImage.imageUrl;
    }
  }

  return getProductImageUrl(product);
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
        {label}
      </AppText>
      <AppText variant="bodySmall" color="textPrimary">
        {value}
      </AppText>
    </View>
  );
}

export function AdminOrderLineItem({
  order,
  line,
  isUpdatingFulfillment = false,
  onFulfillmentStatusChange,
}: AdminOrderLineItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const imageUrl = getLineImageUrl(line);
  const quantity = line.orderQuantiy ?? 0;
  const unitPrice = calculateOrderItemUnitPrice(line, order);
  const lineTotal = calculateOrderItemLineTotal(line, order);
  const sellerName = formatSellerDisplayName(line) ?? '—';
  const sellerId = formatSellerDisplayId(line);
  const variations = formatLineVariations(line);
  const downloadUrl = getDownloadableProductUrl(line);
  const isDownloadable = isDownloadableLine(line);
  const productType = product?.productType?.trim() || '—';
  const fulfillmentStatus = formatAdminLineFulfillmentStatus(line);
  const paymentStatus = formatAdminPaymentStatus(order.paymentStatus);
  const productId = product?._id;
  const currentShippingStatus = line.productData?.shippingStatus ?? '';
  const canEditFulfillment = Boolean(onFulfillmentStatusChange && canUpdateAdminLineFulfillment(order, line));
  const fulfillmentOptions = buildAdminLineFulfillmentOptions(currentShippingStatus);

  const handleFulfillmentChange = (nextStatus: string) => {
    if (!productId || !onFulfillmentStatusChange || nextStatus === currentShippingStatus) {
      return;
    }

    const applyStatus = () => {
      onFulfillmentStatusChange(productId, nextStatus);
    };

    if (isDestructiveAdminLineFulfillment(nextStatus)) {
      Alert.alert(
        'Cancel this line item?',
        'This will set the line fulfillment status to Cancelled.',
        [
          { text: 'Keep item', style: 'cancel' },
          { text: 'Cancel item', style: 'destructive', onPress: applyStatus },
        ],
      );
      return;
    }

    applyStatus();
  };

  const handleDownloadPress = () => {
    if (downloadUrl) {
      void Linking.openURL(downloadUrl);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <AppText variant="caption" color="textMuted">
              No image
            </AppText>
          </View>
        )}

        <View style={styles.summary}>
          <AppText variant="bodyMedium" style={styles.name} numberOfLines={2}>
            {product ? getProductDisplayName(product) : 'Product'}
          </AppText>
          <AppText variant="caption" color="textMuted">
            Type: {productType}
          </AppText>
          {product?.sku ? (
            <AppText variant="caption" color="textMuted">
              SKU: {product.sku}
            </AppText>
          ) : null}
          <AppText variant="bodySmall" color="textSecondary">
            Qty: {quantity || '—'} · Unit: {formatOrderMoney(order, unitPrice)}
          </AppText>
          <AppText variant="bodyMedium" style={styles.lineTotal}>
            Line total: {formatOrderMoney(order, lineTotal)}
          </AppText>
        </View>
      </View>

      <AppDivider />

      <View style={styles.metaGrid}>
        <InfoBlock label="Seller" value={sellerName} />
        <InfoBlock label="Seller ID" value={sellerId ?? '—'} />
        <View style={styles.badgeRow}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Payment status
          </AppText>
          <AppBadge label={paymentStatus} variant={order.paymentStatus === 'PaymentDone' ? 'success' : 'neutral'} />
        </View>
        <View style={styles.badgeRow}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Delivery status
          </AppText>
          {canEditFulfillment ? (
            <View style={styles.fulfillmentSelect}>
              <SelectField
                value={currentShippingStatus === 'Dispatch' ? 'Dispatch' : currentShippingStatus}
                options={fulfillmentOptions}
                onChange={handleFulfillmentChange}
                disabled={isUpdatingFulfillment}
                modalTitle="Change fulfillment status"
              />
            </View>
          ) : fulfillmentStatus === '—' ? (
            <AppText variant="bodySmall" color="textMuted">
              —
            </AppText>
          ) : (
            <AppBadge
              label={fulfillmentStatus}
              variant={orderStatusBadgeVariant(line.productData?.shippingStatus)}
            />
          )}
        </View>
      </View>

      {variations.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Variations
          </AppText>
          {variations.map((variation) => (
            <AppText key={variation} variant="bodySmall" color="textSecondary">
              {variation}
            </AppText>
          ))}
        </View>
      ) : null}

      {line.remark ? (
        <View style={styles.section}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Remark
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {line.remark}
          </AppText>
        </View>
      ) : null}

      {isDownloadable ? (
        <View style={styles.section}>
          <AppText variant="caption" color="textMuted" style={styles.blockLabel}>
            Downloadable product
          </AppText>
          {downloadUrl ? (
            <Pressable accessibilityRole="link" onPress={handleDownloadPress} style={styles.downloadLink}>
              <AppText variant="bodySmall" color="textLink" style={styles.downloadText}>
                Open download link
              </AppText>
            </Pressable>
          ) : (
            <AppText variant="bodySmall" color="textMuted">
              Download link unavailable
            </AppText>
          )}
        </View>
      ) : null}

      {line.shippingRate === -1 ? (
        <AppText variant="caption" color="textMuted">
          Shipping: Free shipping
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  lineTotal: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  metaGrid: {
    gap: spacing.sm,
  },
  infoBlock: {
    gap: spacing.xs,
  },
  blockLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  fulfillmentSelect: {
    flex: 1,
    maxWidth: '62%',
  },
  section: {
    gap: spacing.xs,
  },
  downloadLink: {
    alignSelf: 'flex-start',
  },
  downloadText: {
    fontWeight: '600',
  },
});
