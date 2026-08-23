import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { CartLineItem } from '../../../services/types/cart';
import type { OrderDetail } from '../../../services/types/order';
import { getProductDisplayName, getProductImageUrl } from '../../products/utils/productDisplay';
import {
  formatLineVariations,
  formatSellerDisplayId,
  formatSellerDisplayName,
  getDownloadableProductUrl,
  isDownloadableLine,
} from '../utils/orderDisplay';
import {
  calculateOrderItemLineTotal,
  calculateOrderItemUnitPrice,
  formatOrderMoney,
} from '../utils/orderPricing';

interface OrderLineItemRowProps {
  line: CartLineItem;
  order: OrderDetail;
}

export function OrderLineItemRow({ line, order }: OrderLineItemRowProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const product = line.productData;
  const imageUrl = product ? getProductImageUrl(product) : undefined;
  const quantity = line.orderQuantiy ?? 0;
  const unitPrice = calculateOrderItemUnitPrice(line, order);
  const lineTotal = calculateOrderItemLineTotal(line, order);
  const sellerName = formatSellerDisplayName(line);
  const sellerId = formatSellerDisplayId(line);
  const variations = formatLineVariations(line);
  const downloadUrl = getDownloadableProductUrl(line);
  const isDownloadable = isDownloadableLine(line);

  const handleDownloadPress = () => {
    if (downloadUrl) {
      void Linking.openURL(downloadUrl);
    }
  };

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
            <AppText variant="caption" color="textMuted" style={styles.placeholderText}>
              No image
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <AppText variant="bodyMedium" numberOfLines={2} style={styles.name}>
          {product ? getProductDisplayName(product) : 'Product'}
        </AppText>

        <AppText variant="bodySmall" color="textSecondary">
          Qty: {quantity || '—'}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Unit: {formatOrderMoney(order, unitPrice)}
        </AppText>
        <AppText variant="bodyMedium" color="secondary" style={styles.lineTotal}>
          Total: {formatOrderMoney(order, lineTotal)}
        </AppText>

        {product?.sku ? (
          <AppText variant="caption" color="textMuted">
            SKU: {product.sku}
          </AppText>
        ) : null}

        {sellerName ? (
          <AppText variant="caption" color="textMuted">
            Seller: {sellerName}
            {sellerId ? ` (${sellerId})` : ''}
          </AppText>
        ) : null}

        {variations.map((variation) => (
          <AppText key={variation} variant="caption" color="textMuted">
            {variation}
          </AppText>
        ))}

        {line.remark ? (
          <AppText variant="caption" color="textSecondary" style={styles.remark}>
            Note: {line.remark}
          </AppText>
        ) : null}

        {isDownloadable ? (
          downloadUrl ? (
            <Pressable accessibilityRole="link" onPress={handleDownloadPress} style={styles.downloadLink}>
              <AppText variant="bodySmall" color="textLink" style={styles.downloadText}>
                Download product
              </AppText>
            </Pressable>
          ) : (
            <AppText variant="caption" color="textMuted">
              Download unavailable
            </AppText>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    width: 72,
    height: 72,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: radius.small,
    backgroundColor: colors.disabledBg,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.small,
    backgroundColor: colors.disabledBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  lineTotal: {
    fontWeight: '600',
  },
  remark: {
    marginTop: spacing.xs,
  },
  downloadLink: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  downloadText: {
    fontWeight: '600',
  },
});
