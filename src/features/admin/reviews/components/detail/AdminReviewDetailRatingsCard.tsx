import { StyleSheet, View } from 'react-native';

import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminReviewListItem } from '../../types/adminReviews';
import { formatAdminReviewRating } from '../../utils/adminReviewListDisplay';

export interface AdminReviewDetailRatingsCardProps {
  review: AdminReviewListItem;
}

export function AdminReviewDetailRatingsCard({ review }: AdminReviewDetailRatingsCardProps) {
  return (
    <AdminProductDetailCardShell title="Ratings" icon="star-outline" iconVariant="solid">
      <View style={styles.rows}>
        <AdminProductDetailMetricRow
          label="Average rating"
          value={formatAdminReviewRating(review.avgRating)}
        />
        <AdminProductDetailMetricRow label="Value" value={formatAdminReviewRating(review.value)} />
        <AdminProductDetailMetricRow label="Quality" value={formatAdminReviewRating(review.quality)} />
        <AdminProductDetailMetricRow label="Price" value={formatAdminReviewRating(review.price)} />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 4,
  },
});
