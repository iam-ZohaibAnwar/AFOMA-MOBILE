import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';
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
    <AdminProductDetailCardShell title="Moderation" icon="shield-checkmark-outline" iconVariant="solid" accent>
      <View style={styles.body}>
        <AppText variant="bodySmall" color="textSecondary">
          Update approval status or open the product listing in the storefront.
        </AppText>

        <AppButton
          label={isUpdating ? 'Updating status...' : 'Change status'}
          variant="outline"
          loading={isUpdating}
          onPress={onChangeStatusPress}
        />

        <AppButton
          label="View product"
          variant="secondary"
          disabled={!canPreviewProduct}
          onPress={onViewProductPress}
        />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
});
