import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { CartLineItem } from '../../../services/types/cart';
import type { OrderDetail } from '../../../services/types/order';
import { getProductDisplayName, getProductImageUrl } from '../../products/utils/productDisplay';
import {
  formatLineVariations,
  getDownloadableProductUrl,
  isDownloadableLine,
} from '../utils/orderDisplay';
import { formatOrderLineVariantLabel } from '../utils/orderDetailDisplay';
import {
  calculateOrderItemLineTotal,
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
  const lineTotal = calculateOrderItemLineTotal(line, order);
  const variantLabel = formatOrderLineVariantLabel(line) ?? formatLineVariations(line)[0];
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
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {variantLabel}
          </AppText>
        ) : null}
        <AppText variant="bodySmall" color="textSecondary">
          Qty: {quantity || '—'}
        </AppText>
        {isDownloadable && downloadUrl ? (
          <Pressable accessibilityRole="link" onPress={handleDownloadPress} style={styles.downloadLink}>
            <AppText variant="bodySmall" color="textLink" style={styles.downloadText}>
              Download product
            </AppText>
          </Pressable>
        ) : null}
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
    paddingVertical: spacing.sm,
  },
  imageWrap: {
    width: 64,
    height: 64,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
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
    gap: 2,
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
  },
  downloadLink: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  downloadText: {
    fontWeight: '600',
  },
});
