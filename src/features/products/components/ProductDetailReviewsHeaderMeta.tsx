import { StyleSheet, Text, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export interface ProductDetailReviewsHeaderMetaProps {
  averageRating?: number;
  reviewCount: number;
  theme: PdpTheme;
}

export function ProductDetailReviewsHeaderMeta({
  averageRating,
  reviewCount,
  theme,
}: ProductDetailReviewsHeaderMetaProps) {
  if (!averageRating || reviewCount <= 0) {
    return null;
  }

  return (
    <View style={styles.row} accessibilityRole="text">
      <AppText variant="bodyMedium" style={[styles.ratingValue, { color: theme.textPrimary }]}>
        {averageRating.toFixed(1)}
      </AppText>
      <Text style={[styles.star, { color: theme.starFilled }]} accessibilityElementsHidden>
        ★
      </Text>
      <AppText variant="bodySmall" style={{ color: theme.textMuted }}>
        ({reviewCount.toLocaleString()})
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  ratingValue: {
    fontWeight: '700',
  },
  star: {
    fontSize: 14,
    lineHeight: 16,
  },
});
