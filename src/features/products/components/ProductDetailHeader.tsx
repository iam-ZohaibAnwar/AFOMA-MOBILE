import { StyleSheet, Text, View } from 'react-native';

import { ProductPrice } from '../../../components/ecommerce/ProductPrice';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { Product } from '../../../services/types/product';
import { ProductTypeTags } from './ProductTypeInfo';
import { ProductDetailCompactStepper } from './ProductDetailCompactStepper';

export interface ProductDetailHeaderProps {
  productName: string;
  unitPrice?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  averageRating?: number;
  reviewCount?: number;
  productType?: Product['productType'];
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
  productType,
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
  const showTypeTag = productType === 'Customizable' || productType === 'Downloadable';
  const stockLabel = getStockLabel(outOfStock, selectionIncomplete);

  return (
    <View style={styles.container}>
      <AppText
        variant="bodyLarge"
        style={[styles.title, { color: theme.textPrimary }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {productName}
      </AppText>

      <AppText variant="caption" style={{ color: theme.textMuted }}>
        {stockLabel}
      </AppText>

      <ProductPrice
        price={unitPrice}
        compareAtPrice={compareAtPrice}
        discountPercent={discountPercent}
        size="lg"
        layout="marketplace"
        trailing={
          showQuantityStepper && onDecrement && onIncrement ? (
            <ProductDetailCompactStepper
              value={quantity}
              max={maxQuantity}
              disabled={quantityDisabled}
              onDecrement={onDecrement}
              onIncrement={onIncrement}
            />
          ) : undefined
        }
      />

      {showRating || showTypeTag ? (
        <View style={styles.metaRow}>
          {showTypeTag ? <ProductTypeTags productType={productType} /> : null}
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
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
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
