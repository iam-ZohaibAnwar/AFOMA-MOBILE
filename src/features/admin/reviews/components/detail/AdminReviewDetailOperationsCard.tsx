import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { spacing } from '../../../../../design-system';
import type { AdminReviewListItem } from '../../types/adminReviews';
import { canOpenAdminReviewProductPreview } from '../../utils/adminReviewListDisplay';

export interface AdminReviewDetailOperationsCardProps {
  review: AdminReviewListItem;
  isUpdating: boolean;
  onChangeStatusPress: () => void;
  onViewProductPress: () => void;
}

export function AdminReviewDetailOperationsCard({
  review,
  isUpdating,
  onChangeStatusPress,
  onViewProductPress,
}: AdminReviewDetailOperationsCardProps) {
  const canPreviewProduct = canOpenAdminReviewProductPreview(review);

  return (
    <View style={styles.actions}>
      <AppButton
        label={isUpdating ? 'Updating status…' : 'Change status'}
        variant="primary"
        loading={isUpdating}
        onPress={onChangeStatusPress}
        fullWidth
      />
      <AppButton
        label="View product"
        variant="outline"
        disabled={!canPreviewProduct}
        onPress={onViewProductPress}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
});
