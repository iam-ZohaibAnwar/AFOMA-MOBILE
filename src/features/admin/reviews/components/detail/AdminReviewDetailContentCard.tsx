import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminReviewListItem } from '../../types/adminReviews';
import { getAdminReviewText } from '../../utils/adminReviewsDisplay';

export interface AdminReviewDetailContentCardProps {
  review: AdminReviewListItem;
}

export function AdminReviewDetailContentCard({ review }: AdminReviewDetailContentCardProps) {
  return (
    <AdminProductDetailCardShell title="Review" icon="document-text-outline" iconVariant="solid">
      <View style={styles.body}>
        <AppText variant="bodyMedium" style={styles.reviewText}>
          {getAdminReviewText(review)}
        </AppText>
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.sm,
  },
  reviewText: {
    lineHeight: 22,
  },
});
