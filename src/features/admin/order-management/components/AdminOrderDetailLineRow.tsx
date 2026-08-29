import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { CartLineItem } from '../../../../services/types/cart';
import { getProductDisplayName, getProductImageUrl } from '../../../products/utils/productDisplay';
import { formatLineVariations } from '../../../orders/utils/orderDisplay';
import { formatOrderLineVariantLabel } from '../../../orders/utils/orderDetailDisplay';
import {
  calculateOrderItemLineTotal,
  formatOrderMoney,
} from '../../../orders/utils/orderPricing';
import type { AdminOrderDetail } from '../types/adminOrderManagement';

interface AdminOrderDetailLineRowProps {
  order: AdminOrderDetail;
  line: CartLineItem;
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

export function AdminOrderDetailLineRow({ order, line }: AdminOrderDetailLineRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const imageUrl = getLineImageUrl(line);
  const quantity = line.orderQuantiy ?? 0;
  const lineTotal = calculateOrderItemLineTotal(line, order);
  const variantLabel =
    formatOrderLineVariantLabel(line) ?? formatLineVariations(line).join(' · ') ?? undefined;
  const sku = product?.sku?.trim();

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl && !imageFailed ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppText variant="caption" color="textMuted">
              No image
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <AppText variant="bodyMedium" numberOfLines={2} style={styles.name}>
          {product ? getProductDisplayName(product) : 'Product'}
        </AppText>
        {variantLabel ? (
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
            {variantLabel}
          </AppText>
        ) : null}
        {sku ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            SKU: {sku}
          </AppText>
        ) : null}
        <AppText variant="bodySmall" color="textSecondary">
          Qty: {quantity || '—'}
        </AppText>
      </View>

      <AppText variant="bodyMedium" style={styles.price}>
        {formatOrderMoney(order, lineTotal)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  imageWrap: {
    width: 72,
    height: 72,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '700',
    flexShrink: 0,
    paddingTop: 2,
    maxWidth: 88,
    textAlign: 'right',
  },
});
