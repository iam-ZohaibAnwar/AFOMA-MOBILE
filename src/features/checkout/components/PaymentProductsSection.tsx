import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { CartLineItem } from '../../../services/types/cart';
import { getCartLineAttributes } from '../../cart/utils/cartUtils';
import {
  formatProductPrice,
  getProductDisplayName,
  getProductImageUrl,
} from '../../products/utils/productDisplay';

export interface PaymentProductEntry {
  id: string;
  line: CartLineItem;
  displayLineTotal?: number;
}

export interface PaymentProductsSectionProps {
  entries: PaymentProductEntry[];
  currency?: string;
}

function PaymentProductRow({
  line,
  currency,
  displayLineTotal,
}: {
  line: CartLineItem;
  currency: string;
  displayLineTotal?: number;
}) {
  const product = line.productData;
  const imageUrl = product ? getProductImageUrl(product) : undefined;
  const attributes = getCartLineAttributes(line);
  const lineTotal = displayLineTotal ?? line.totalAmount ?? 0;

  return (
    <View style={styles.productRow}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback} />
        )}
      </View>

      <View style={styles.productContent}>
        <AppText variant="bodyMedium" style={styles.productName} numberOfLines={2}>
          {product ? getProductDisplayName(product) : 'Product'}
        </AppText>
        {attributes ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {attributes}
          </AppText>
        ) : null}
        <AppText variant="bodyMedium" style={styles.productPrice}>
          {formatProductPrice(lineTotal, currency)}
        </AppText>
      </View>
    </View>
  );
}

export function PaymentProductsSection({ entries, currency = 'CAD' }: PaymentProductsSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.title}>
        Products ({entries.length})
      </AppText>

      <View style={styles.list}>
        {entries.map((entry) => (
          <PaymentProductRow
            key={entry.id}
            line={entry.line}
            currency={currency}
            displayLineTotal={entry.displayLineTotal}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  productContent: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  productPrice: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
});
