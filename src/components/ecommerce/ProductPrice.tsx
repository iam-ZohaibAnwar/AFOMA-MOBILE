import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDisplayCurrency } from '../../app/providers/PricingProvider';
import { colors, spacing, typography } from '../../design-system';
import {
  formatProductPrice,
} from '../../features/products/utils/productDisplay';

type ProductPriceSize = 'sm' | 'md' | 'lg';
type ProductPriceLayout = 'inline' | 'marketplace';

const MARKETPLACE_META_ROW_MIN_HEIGHT: Record<ProductPriceSize, number> = {
  sm: 14,
  md: 15,
  lg: 16,
};

export interface ProductPriceProps {
  price?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  size?: ProductPriceSize;
  layout?: ProductPriceLayout;
  /** Renders beside the sale price on the marketplace layout's top row. */
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProductPrice({
  price,
  compareAtPrice,
  discountPercent,
  size = 'md',
  layout = 'inline',
  trailing,
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
        <View style={styles.marketplaceSaleRow}>
          <Text
            style={[styles.price, styles[`price_${size}`], styles.marketplaceSalePrice]}
            numberOfLines={1}
          >
            {formatProductPrice(price, currency)}
          </Text>
          {trailing ? <View style={styles.marketplaceTrailing}>{trailing}</View> : null}
        </View>
        <View
          style={[
            styles.marketplaceMetaRow,
            { minHeight: MARKETPLACE_META_ROW_MIN_HEIGHT[size] },
          ]}
        >
          {hasDiscount ? (
            <Text
              style={[
                styles.compareAt,
                styles.marketplaceCompareAtInline,
                styles[`marketplaceCompareAtInline_${size}`],
              ]}
              numberOfLines={1}
            >
              {formatProductPrice(compareAtPrice, currency)}
            </Text>
          ) : null}
          {showPercent ? (
            <Text
              style={[
                styles.discount,
                styles.marketplaceDiscountInline,
                styles[`marketplaceDiscountInline_${size}`],
              ]}
              numberOfLines={1}
            >
              -{Math.round(discountPercent)}%
            </Text>
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
  },
  marketplaceSaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 20,
  },
  marketplaceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    columnGap: 4,
  },
  marketplaceSalePrice: {
    flexShrink: 0,
    color: colors.price,
  },
  marketplaceTrailing: {
    flexShrink: 0,
  },
  marketplaceCompareAtInline: {
    flexShrink: 1,
    color: colors.priceStrike,
    textDecorationLine: 'line-through',
  },
  marketplaceCompareAtInline_sm: {
    fontSize: 10,
    lineHeight: 13,
  },
  marketplaceCompareAtInline_md: {
    fontSize: 11,
    lineHeight: 14,
  },
  marketplaceCompareAtInline_lg: {
    fontSize: 12,
    lineHeight: 15,
  },
  marketplaceDiscountInline: {
    flexShrink: 0,
    fontWeight: '700',
    color: colors.priceSale,
  },
  marketplaceDiscountInline_sm: {
    fontSize: 10,
    lineHeight: 13,
  },
  marketplaceDiscountInline_md: {
    fontSize: 11,
    lineHeight: 14,
  },
  marketplaceDiscountInline_lg: {
    fontSize: 12,
    lineHeight: 15,
  },
});
