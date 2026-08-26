import { StyleSheet, View } from 'react-native';

import { Rating } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface ShopReviewsSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export function ShopReviewsSummary({ averageRating, reviewCount }: ShopReviewsSummaryProps) {
  return (
    <View style={styles.card}>
      <AppText variant="h1" style={styles.averageRating}>
        {averageRating.toFixed(1)}
      </AppText>

      <Rating
        value={averageRating}
        size="md"
        starFilledColor="#EAB308"
        starEmptyColor={colors.borderStrong}
        style={styles.stars}
      />

      <AppText variant="bodySmall" color="textMuted">
        Based on {reviewCount.toLocaleString()} review{reviewCount === 1 ? '' : 's'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  averageRating: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stars: {
    justifyContent: 'center',
  },
});
