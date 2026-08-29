import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { colors, spacing } from '../../../../../design-system';

export interface SellerCouponDetailOperationsCardProps {
  isDeleting: boolean;
  onEditPress: () => void;
  onDeletePress: () => void;
}

export function SellerCouponDetailOperationsCard({
  isDeleting,
  onEditPress,
  onDeletePress,
}: SellerCouponDetailOperationsCardProps) {
  return (
    <View style={styles.actions}>
      <AppButton label="Edit" variant="primary" onPress={onEditPress} disabled={isDeleting} fullWidth />
      <AppButton
        label={isDeleting ? 'Deleting…' : 'Delete'}
        variant="outline"
        loading={isDeleting}
        disabled={isDeleting}
        onPress={onDeletePress}
        fullWidth
        labelStyle={styles.deleteLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  deleteLabel: {
    color: colors.error,
  },
});
