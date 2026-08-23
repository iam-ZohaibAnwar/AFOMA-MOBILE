import { useState } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { CartLineItem } from '../../../../services/types/cart';
import { getProductDisplayName, getProductImageUrl } from '../../../products/utils/productDisplay';
import {
  formatLineVariations,
  getDownloadableProductUrl,
  isDownloadableLine,
} from '../../../orders/utils/orderDisplay';
import {
  calculateOrderItemLineTotal,
  formatOrderMoney,
} from '../../../orders/utils/orderPricing';
import type { SellerOrderDetail } from '../types/sellerOrder';
import type { SellerLineFulfillmentStatus } from '../types/sellerOrder';
import { isSellerOrderCancelled } from '../utils/sellerOrderMappers';
import { SellerOrderFulfillmentStatus } from './SellerOrderFulfillmentStatus';

export interface SellerOrderLineItemProps {
  order: SellerOrderDetail;
  line: CartLineItem;
  isUpdating?: boolean;
  onFulfillmentStatusChange: (productId: string, status: SellerLineFulfillmentStatus) => void;
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

export function SellerOrderLineItem({
  order,
  line,
  isUpdating = false,
  onFulfillmentStatusChange,
}: SellerOrderLineItemProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const productId = product?._id;
  const imageUrl = getLineImageUrl(line);
  const variations = formatLineVariations(line);
  const lineTotal = calculateOrderItemLineTotal(line, order, false, true);
  const downloadUrl = getDownloadableProductUrl(line);
  const isDownloadable = isDownloadableLine(line);
  const orderCancelled = isSellerOrderCancelled(order);

  const handleDownload = () => {
    if (downloadUrl && !orderCancelled) {
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
          {product?.sku ? (
            <AppText variant="caption" color="textMuted">
              SKU: {product.sku}
            </AppText>
          ) : null}
          <AppText variant="bodySmall" color="textSecondary">
            Qty: {line.orderQuantiy ?? '—'}
          </AppText>
          <AppText variant="bodyMedium" style={styles.price}>
            {formatOrderMoney(order, lineTotal)}
          </AppText>
        </View>
      </View>

      <AppDivider />

      <View style={styles.section}>
        <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
          Fulfillment
        </AppText>
        {productId ? (
          <SellerOrderFulfillmentStatus
            order={order}
            line={line}
            isUpdating={isUpdating}
            onChange={(status) => onFulfillmentStatusChange(productId, status)}
          />
        ) : null}
      </View>

      {variations.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
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
          <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
            Remark
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {line.remark}
          </AppText>
        </View>
      ) : null}

      {isDownloadable && downloadUrl ? (
        <AppButton
          label="Download product file"
          variant="outline"
          size="md"
          disabled={orderCancelled}
          onPress={handleDownload}
        />
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
  price: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
