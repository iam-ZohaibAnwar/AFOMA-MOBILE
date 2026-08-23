import { Alert, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { AdminProductDetail } from '../types/adminProductManagement';
import type { AdminProductApprovalStatus } from '../types/adminProductOperations';
import {
  buildAdminProductApprovalOptions,
  getAdminProductVisibilityLabel,
  isAdminProductActive,
  isDestructiveAdminProductApproval,
} from '../utils/adminProductOperations';

export interface AdminProductOperationsSectionProps {
  product: AdminProductDetail;
  isUpdatingApproval: boolean;
  isUpdatingVisibility: boolean;
  isDeleting: boolean;
  isDuplicating?: boolean;
  onApprovalChange: (productStatus: AdminProductApprovalStatus | string) => void;
  onEnablePress: () => void;
  onDisablePress: () => void;
  onDeletePress: () => void;
  onDuplicatePress?: () => void;
}

export function AdminProductOperationsSection({
  product,
  isUpdatingApproval,
  isUpdatingVisibility,
  isDeleting,
  isDuplicating = false,
  onApprovalChange,
  onEnablePress,
  onDisablePress,
  onDeletePress,
  onDuplicatePress,
}: AdminProductOperationsSectionProps) {
  const currentApproval = product.productStatus?.trim() ?? '';
  const approvalOptions = buildAdminProductApprovalOptions(currentApproval);
  const isActive = isAdminProductActive(product.status);
  const visibilityLabel = getAdminProductVisibilityLabel(product.status);
  const isBusy = isUpdatingApproval || isUpdatingVisibility || isDeleting || isDuplicating;

  const handleApprovalChange = (nextStatus: string) => {
    if (nextStatus === currentApproval) {
      return;
    }

    const applyApproval = () => {
      onApprovalChange(nextStatus);
    };

    if (isDestructiveAdminProductApproval(nextStatus)) {
      Alert.alert(
        'Disapprove this product?',
        'The product will be marked as Disapproved. Store visibility stays unchanged.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disapprove', style: 'destructive', onPress: applyApproval },
        ],
      );
      return;
    }

    applyApproval();
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete product?',
      'This permanently removes the product. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDeletePress },
      ],
    );
  };

  const handleDuplicatePress = () => {
    if (!onDuplicatePress) {
      return;
    }

    const isCustomizable = product.productType === 'Customizable';
    Alert.alert(
      'Duplicate product?',
      isCustomizable
        ? 'Creates a new Draft product with the same base configuration. Images, videos, and downloadable files are not copied. Variations must be configured separately on the new product. The original product is not changed.'
        : 'Creates a new Draft product with the same configuration. Images, videos, and downloadable files are not copied. The original product is not changed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Duplicate', onPress: onDuplicatePress },
      ],
    );
  };

  return (
    <AppCard>
      <AppText variant="label" style={styles.title}>
        Operations
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.note}>
        Approval and store visibility are independent. A product can be Approved + Inactive or Pending
        + Active.
      </AppText>

      <View style={styles.block}>
        <SelectField
          label="Approval status"
          value={currentApproval}
          options={approvalOptions}
          onChange={handleApprovalChange}
          disabled={isBusy}
          modalTitle="Change approval status"
        />
      </View>

      <View style={styles.block}>
        <AppText variant="caption" color="textMuted" style={styles.visibilityLabel}>
          Store visibility: {visibilityLabel}
        </AppText>
        <View style={styles.visibilityActions}>
          <AppButton
            label={isUpdatingVisibility ? 'Updating...' : 'Enable'}
            variant="outline"
            loading={isUpdatingVisibility}
            disabled={isBusy || isActive}
            onPress={onEnablePress}
            style={styles.visibilityButton}
          />
          <AppButton
            label={isUpdatingVisibility ? 'Updating...' : 'Disable'}
            variant="outline"
            loading={isUpdatingVisibility}
            disabled={isBusy || !isActive}
            onPress={onDisablePress}
            style={styles.visibilityButton}
          />
        </View>
      </View>

      <AppButton
        label={isDuplicating ? 'Duplicating...' : 'Duplicate product'}
        variant="outline"
        loading={isDuplicating}
        disabled={isBusy || !onDuplicatePress}
        onPress={handleDuplicatePress}
      />

      <AppButton
        label={isDeleting ? 'Deleting...' : 'Delete product'}
        variant="outline"
        loading={isDeleting}
        disabled={isBusy}
        onPress={handleDeletePress}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  note: {
    marginBottom: spacing.md,
  },
  block: {
    marginBottom: spacing.md,
  },
  visibilityLabel: {
    marginBottom: spacing.sm,
  },
  visibilityActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  visibilityButton: {
    flex: 1,
  },
});
