import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Skeleton } from '../../../components/ecommerce';
import { ChevronExpandIcon } from '../../../components/ui/ChevronExpandIcon';
import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import type { ProductReviewAverages } from '../hooks/useProductReviews';
import type { Review } from '../../../services/types/review';
import { ProductDetailReviewsContent } from './ProductDetailReviewsContent';

export interface ProductDetailReviewsSectionProps {
  averageRating?: number;
  reviewAverages: ProductReviewAverages;
  reviewCount: number;
  reviews: Review[];
  isLoading: boolean;
  theme: PdpTheme;
}

interface RatingBreakdownRowProps {
  label: string;
  value?: number;
  theme: PdpTheme;
}

function RatingBreakdownRow({ label, value, theme }: RatingBreakdownRowProps) {
  const normalized = typeof value === 'number' && value > 0 ? Math.min(value, 5) : 0;
  const fillPercent = (normalized / 5) * 100;

  return (
    <View style={styles.breakdownRow}>
      <AppText
        variant="bodySmall"
        style={[styles.breakdownLabel, { color: theme.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </AppText>
      <View style={[styles.barTrack, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${fillPercent}%`,
              backgroundColor: theme.textPrimary,
            },
          ]}
        />
      </View>
      <AppText variant="bodySmall" style={[styles.breakdownValue, { color: theme.textPrimary }]}>
        {normalized > 0 ? normalized.toFixed(1) : '—'}
      </AppText>
    </View>
  );
}

function ProductDetailReviewsSkeleton() {
  return (
    <View
      style={styles.skeletonWrap}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading item reviews"
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <Skeleton variant="text" height={40} width={56} />
          <Skeleton variant="text" height={14} width={96} />
        </View>

        <View style={styles.breakdownColumn}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={`breakdown-skeleton-${index}`} style={styles.breakdownSkeletonRow}>
              <Skeleton variant="text" height={12} width={104} />
              <View style={styles.breakdownSkeletonBarWrap}>
                <Skeleton variant="rect" height={8} style={styles.breakdownSkeletonBar} />
              </View>
              <Skeleton variant="text" height={12} width={28} />
            </View>
          ))}
        </View>
      </View>

      {Array.from({ length: 2 }).map((_, index) => (
        <View key={`review-skeleton-${index}`} style={styles.reviewSkeletonRow}>
          <View style={styles.reviewHeaderSkeleton}>
            <Skeleton variant="text" height={16} width="55%" />
            <Skeleton variant="rect" height={14} width={72} style={styles.starsSkeleton} />
          </View>
          <Skeleton variant="text" height={14} width="100%" />
          <Skeleton variant="text" height={14} width="88%" />
        </View>
      ))}
    </View>
  );
}

function CollapsedRatingMeta({
  averageRating,
  theme,
}: {
  averageRating?: number;
  theme: PdpTheme;
}) {
  if (!averageRating) {
    return null;
  }

  return (
    <View style={styles.collapsedMeta} accessibilityRole="text">
      <AppText variant="bodyMedium" style={[styles.collapsedScore, { color: theme.textPrimary }]}>
        {averageRating.toFixed(1)}
      </AppText>
      <Text style={[styles.collapsedStar, { color: theme.starFilled }]} accessibilityElementsHidden>
        ★
      </Text>
    </View>
  );
}

export function ProductDetailReviewsSection({
  averageRating,
  reviewAverages,
  reviewCount,
  reviews,
  isLoading,
  theme,
}: ProductDetailReviewsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const hasReviews = reviewCount > 0 && reviews.length > 0;

  return (
    <View style={[styles.section, { borderTopColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
          Item reviews
        </AppText>
        <View style={styles.headerSpacer} />
        {!expanded ? <CollapsedRatingMeta averageRating={averageRating} theme={theme} /> : null}
        <ChevronExpandIcon expanded={expanded} color={theme.textMuted} size={18} />
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {isLoading ? (
            <ProductDetailReviewsSkeleton />
          ) : !hasReviews ? (
            <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
              No reviews yet for this product.
            </AppText>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={styles.scoreRow}>
                    <AppText
                      variant="h1"
                      style={[styles.bigScore, { color: theme.textPrimary }]}
                    >
                      {(averageRating ?? 0).toFixed(1)}
                    </AppText>
                    <Text
                      style={[styles.summaryStar, { color: theme.starFilled }]}
                      accessibilityElementsHidden
                    >
                      ★
                    </Text>
                  </View>
                  <AppText variant="bodySmall" style={{ color: theme.textMuted }}>
                    {reviewCount.toLocaleString()} item review{reviewCount === 1 ? '' : 's'}
                  </AppText>
                </View>

                <View style={styles.breakdownColumn}>
                  <RatingBreakdownRow
                    label="Item quality"
                    value={reviewAverages.avgQuality}
                    theme={theme}
                  />
                  <RatingBreakdownRow label="Value" value={reviewAverages.avgValue} theme={theme} />
                  <RatingBreakdownRow label="Price" value={reviewAverages.avgPrice} theme={theme} />
                </View>
              </View>

              <ProductDetailReviewsContent reviews={reviews} theme={theme} />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  title: {
    flexShrink: 1,
    fontWeight: '700',
  },
  headerSpacer: {
    flex: 1,
    minWidth: spacing.sm,
  },
  collapsedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
  collapsedScore: {
    fontWeight: '700',
  },
  collapsedStar: {
    fontSize: 14,
    lineHeight: 16,
  },
  body: {
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  skeletonWrap: {
    gap: spacing.lg,
  },
  breakdownSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakdownSkeletonBarWrap: {
    flex: 1,
  },
  breakdownSkeletonBar: {
    borderRadius: radius.pill,
  },
  reviewSkeletonRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  reviewHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  starsSkeleton: {
    borderRadius: radius.pill,
  },
  summaryRow: {
    gap: spacing.md,
  },
  summaryLeft: {
    gap: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bigScore: {
    fontWeight: '700',
    lineHeight: 40,
  },
  summaryStar: {
    fontSize: 18,
    lineHeight: 28,
    marginTop: 2,
  },
  breakdownColumn: {
    width: '100%',
    gap: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  breakdownLabel: {
    width: 104,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 8,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  breakdownValue: {
    width: 28,
    textAlign: 'right',
    fontWeight: '600',
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.9,
  },
});
