import { Image, StyleSheet, View } from 'react-native';

import { Rating } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { Review } from '../../../services/types/review';
import {
  formatReviewRelativeDate,
  getReviewBody,
  getReviewHeadline,
  getReviewProductImages,
  getReviewRating,
  getReviewerAvatarColors,
  getReviewerInitial,
  getReviewerName,
} from '../utils/shopReviewsDisplay';

export interface ShopReviewCardProps {
  review: Review;
}

export function ShopReviewCard({ review }: ShopReviewCardProps) {
  const avatarColors = getReviewerAvatarColors(review);
  const headline = getReviewHeadline(review);
  const productImages = getReviewProductImages(review);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColors.background }]}>
          <AppText variant="label" style={[styles.avatarText, { color: avatarColors.text }]}>
            {getReviewerInitial(review)}
          </AppText>
        </View>

        <View style={styles.headerMeta}>
          <View style={styles.titleRow}>
            <AppText variant="bodyMedium" style={styles.reviewerName} numberOfLines={1}>
              {getReviewerName(review)}
            </AppText>
            <Rating
              value={getReviewRating(review)}
              size="sm"
              starFilledColor="#EAB308"
              starEmptyColor={colors.borderStrong}
            />
          </View>

          <AppText variant="caption" color="textMuted">
            Verified Buyer • {formatReviewRelativeDate(review.createdAt)}
          </AppText>
        </View>
      </View>

      {headline ? (
        <AppText variant="bodyMedium" style={styles.headline}>
          {headline}
        </AppText>
      ) : null}

      <AppText variant="bodySmall" color="textSecondary" style={styles.body}>
        {getReviewBody(review)}
      </AppText>

      {productImages.length > 0 ? (
        <View style={styles.imageRow}>
          {productImages.map((uri, index) => (
            <Image key={`${uri}-${index}`} source={{ uri }} style={styles.productImage} resizeMode="cover" />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  avatarText: {
    fontWeight: '700',
  },
  headerMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reviewerName: {
    flex: 1,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headline: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  body: {
    lineHeight: 22,
  },
  imageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
});
