import { StyleSheet, Text, View } from 'react-native';

import { ProductPrice } from '../../../components/ecommerce/ProductPrice';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import { ProductDetailCompactStepper } from './ProductDetailCompactStepper';

export interface ProductDetailHeaderProps {
  productName: string;
  unitPrice?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  averageRating?: number;
  reviewCount?: number;
  theme: PdpTheme;
  showQuantityStepper?: boolean;
  quantity?: number;
  maxQuantity?: number;
  quantityDisabled?: boolean;
  onDecrement?: () => void;
  onIncrement?: () => void;
  outOfStock?: boolean;
  selectionIncomplete?: boolean;
}

function getStockLabel(outOfStock: boolean, selectionIncomplete: boolean): string {
  if (selectionIncomplete) {
    return 'Select options to check availability';
  }

  if (outOfStock) {
    return 'Out of stock';
  }

  return 'Available in stock';
}

export function ProductDetailHeader({
  productName,
  unitPrice,
  compareAtPrice,
  discountPercent,
  averageRating,
  reviewCount = 0,
  theme,
  showQuantityStepper = false,
  quantity = 1,
  maxQuantity,
  quantityDisabled = false,
  onDecrement,
  onIncrement,
  outOfStock = false,
  selectionIncomplete = false,
}: ProductDetailHeaderProps) {
  const showRating = averageRating !== undefined && averageRating > 0;
  const stockLabel = getStockLabel(outOfStock, selectionIncomplete);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <AppText variant="h2" style={[styles.title, { color: theme.textPrimary }]} numberOfLines={3}>
          {productName}
        </AppText>

        {showQuantityStepper && onDecrement && onIncrement ? (
          <ProductDetailCompactStepper
            value={quantity}
            max={maxQuantity}
            disabled={quantityDisabled}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
          />
        ) : null}
      </View>

      <AppText variant="caption" style={{ color: theme.textMuted }}>
        {stockLabel}
      </AppText>

      <ProductPrice
        price={unitPrice}
        compareAtPrice={compareAtPrice}
        discountPercent={discountPercent}
        size="lg"
        layout="marketplace"
      />

      {showRating ? (
        <View style={styles.ratingRow} accessibilityRole="text">
          <Text style={[styles.singleStar, { color: theme.starFilled }]}>★</Text>
          <AppText variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '700' }}>
            {averageRating!.toFixed(1)}
          </AppText>
          <AppText variant="bodySmall" style={{ color: theme.textMuted }}>
            ({reviewCount} Review{reviewCount === 1 ? '' : 's'})
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  singleStar: {
    fontSize: 16,
    lineHeight: 18,
  },
});
