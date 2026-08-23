import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerReviewListItem } from '../types/sellerReview';
import {
  formatSellerReviewRating,
  getSellerReviewProductName,
} from '../utils/sellerReviewsDisplay';

export interface SellerReviewCardProps {
  review: SellerReviewListItem;
  onPress?: () => void;
}

function RatingField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.ratingField}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.ratingValue}>
        {value}
      </AppText>
    </View>
  );
}

export function SellerReviewCard({ review, onPress }: SellerReviewCardProps) {
  const content = (
    <View style={styles.card}>
      <AppText variant="bodyMedium" style={styles.productName}>
        {getSellerReviewProductName(review)}
      </AppText>

      <View style={styles.ratingsRow}>
        <RatingField label="Average" value={formatSellerReviewRating(review.avgRating)} />
        <RatingField label="Price" value={formatSellerReviewRating(review.price)} />
        <RatingField label="Value" value={formatSellerReviewRating(review.value)} />
        <RatingField label="Quality" value={formatSellerReviewRating(review.quality)} />
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  productName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  ratingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  ratingField: {
    minWidth: '22%',
    gap: 2,
  },
  ratingValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
