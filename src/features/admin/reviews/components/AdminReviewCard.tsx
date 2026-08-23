import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminReviewListItem } from '../types/adminReviews';
import {
  getAdminReviewCustomerName,
  getAdminReviewProductName,
  getAdminReviewTitle,
} from '../utils/adminReviewsContent';
import { getAdminReviewCustomerEmail, getAdminReviewText } from '../utils/adminReviewsDisplay';
import { AdminReviewStatusBadge } from './AdminReviewStatusBadge';

export interface AdminReviewCardProps {
  review: AdminReviewListItem;
  onPress?: () => void;
}

export function AdminReviewCard({ review, onPress }: AdminReviewCardProps) {
  const customerEmail = getAdminReviewCustomerEmail(review);
  const reviewText = getAdminReviewText(review);
  const truncatedText = reviewText.length > 140 ? `${reviewText.slice(0, 140).trim()}…` : reviewText;

  const content = (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.identityCopy}>
          <AppText variant="bodyMedium" style={styles.customerName}>
            {getAdminReviewCustomerName(review)}
          </AppText>
          {customerEmail ? (
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {customerEmail}
            </AppText>
          ) : null}
        </View>
        <AdminReviewStatusBadge status={review.reviewStatus} />
      </View>

      <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
        {getAdminReviewProductName(review)}
      </AppText>

      <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
        {getAdminReviewTitle(review)}
      </AppText>

      <AppText variant="bodySmall" color="textSecondary" numberOfLines={3}>
        {truncatedText}
      </AppText>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  identityCopy: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
