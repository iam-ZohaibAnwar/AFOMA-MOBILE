import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDisplayCurrency } from '../../app/providers/PricingProvider';
import { colors, spacing, typography } from '../../design-system';
import {
  formatProductPrice,
} from '../../features/products/utils/productDisplay';

type ProductPriceSize = 'sm' | 'md' | 'lg';
type ProductPriceLayout = 'inline' | 'marketplace';

const MARKETPLACE_COMPARE_ROW_HEIGHT = 18;

export interface ProductPriceProps {
  price?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  size?: ProductPriceSize;
  layout?: ProductPriceLayout;
  style?: StyleProp<ViewStyle>;
}

export function ProductPrice({
  price,
  compareAtPrice,
  discountPercent,
  size = 'md',
  layout = 'inline',
  style,
}: ProductPriceProps) {
  const currency = useDisplayCurrency();
  const hasDiscount =
    compareAtPrice !== undefined &&
    price !== undefined &&
    compareAtPrice > price;

  const showPercent =
    hasDiscount &&
    discountPercent !== undefined &&
    Number.isFinite(discountPercent) &&
    discountPercent > 0;

  if (layout === 'marketplace') {
    return (
      <View style={[styles.marketplaceBlock, style]}>
        <Text style={[styles.price, styles[`price_${size}`], styles.marketplaceSalePrice]}>
          {formatProductPrice(price, currency)}
        </Text>
        <View style={styles.marketplaceCompareRow}>
          {hasDiscount ? (
            <>
              <Text
                style={[
                  styles.compareAt,
                  styles[`compareAt_${size}`],
                  styles.marketplaceCompareAt,
                ]}
                numberOfLines={1}
              >
                {formatProductPrice(compareAtPrice, currency)}
              </Text>
              {showPercent ? (
                <Text
                  style={[
                    styles.discount,
                    styles[`discount_${size}`],
                    styles.marketplaceDiscount,
                  ]}
                  numberOfLines={1}
                >
                  -{Math.round(discountPercent)}%
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.price, styles[`price_${size}`]]}>
        {formatProductPrice(price, currency)}
      </Text>
      {hasDiscount ? (
        <Text style={[styles.compareAt, styles[`compareAt_${size}`]]}>
          {formatProductPrice(compareAtPrice, currency)}
        </Text>
      ) : null}
      {showPercent ? (
        <Text style={[styles.discount, styles[`discount_${size}`]]}>
          ({Math.round(discountPercent)}% off)
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    ...typography.price,
  },
  price_sm: {
    fontSize: 13,
    lineHeight: 18,
  },
  price_md: {
    fontSize: 16,
    lineHeight: 20,
  },
  price_lg: {
    fontSize: 18,
    lineHeight: 22,
  },
  compareAt: {
    ...typography.bodySmall,
    color: colors.priceStrike,
    textDecorationLine: 'line-through',
  },
  compareAt_sm: {
    fontSize: 12,
  },
  compareAt_md: {
    fontSize: 13,
  },
  compareAt_lg: {
    fontSize: 14,
  },
  discount: {
    ...typography.bodySmall,
    color: colors.warningText,
  },
  discount_sm: {
    fontSize: 11,
  },
  discount_md: {
    fontSize: 12,
  },
  discount_lg: {
    fontSize: 13,
  },
  marketplaceBlock: {
    width: '100%',
    gap: 2,
  },
  marketplaceSalePrice: {
    color: colors.price,
  },
  marketplaceCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: MARKETPLACE_COMPARE_ROW_HEIGHT,
  },
  marketplaceCompareAt: {
    flexShrink: 1,
    color: colors.priceStrike,
  },
  marketplaceDiscount: {
    flexShrink: 0,
    fontWeight: '700',
    color: colors.priceSale,
  },
});
