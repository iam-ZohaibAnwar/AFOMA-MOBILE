import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';

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
    <AdminProductDetailCardShell title="Operations" icon="settings-outline" iconVariant="solid" accent>
      <View style={styles.body}>
        <AppText variant="bodySmall" color="textSecondary">
          Edit coupon settings, notify marketplace users, or remove the coupon permanently.
        </AppText>

        <AppButton label="Edit coupon" variant="outline" onPress={onEditPress} disabled={isDeleting} />
        <AppButton
          label={isNotifying ? 'Sending notification...' : 'Notify users'}
          variant="secondary"
          loading={isNotifying}
          disabled={notifyDisabled || isDeleting}
          onPress={onNotifyPress}
        />
        <AppButton
          label={isDeleting ? 'Deleting coupon...' : 'Delete coupon'}
          variant="outline"
          loading={isDeleting}
          disabled={isNotifying}
          onPress={onDeletePress}
          labelStyle={styles.deleteLabel}
        />
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  deleteLabel: {
    color: '#B91C1C',
  },
});
