import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { colors, spacing } from '../../../../../design-system';

export interface AdminCouponDetailOperationsCardProps {
  isDeleting: boolean;
  isNotifying: boolean;
  notifyDisabled: boolean;
  onEditPress: () => void;
  onNotifyPress: () => void;
  onDeletePress: () => void;
}

export function AdminCouponDetailOperationsCard({
  isDeleting,
  isNotifying,
  notifyDisabled,
  onEditPress,
  onNotifyPress,
  onDeletePress,
}: AdminCouponDetailOperationsCardProps) {
  return (
    <View style={styles.actions}>
      <AppButton label="Edit" variant="primary" onPress={onEditPress} disabled={isDeleting || isNotifying} fullWidth />
      <AppButton
        label={isNotifying ? 'Sending notification…' : 'Notify'}
        variant="secondary"
        loading={isNotifying}
        disabled={notifyDisabled || isDeleting}
        onPress={onNotifyPress}
        fullWidth
      />
      <AppButton
        label={isDeleting ? 'Deleting…' : 'Delete'}
        variant="outline"
        loading={isDeleting}
        disabled={isNotifying}
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
