import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../../admin/product-management/components/detail/AdminProductDetailCardShell';

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
    <AdminProductDetailCardShell title="Operations" icon="settings-outline" iconVariant="solid" accent>
      <View style={styles.body}>
        <AppText variant="bodySmall" color="textSecondary">
          Edit coupon settings or remove the coupon permanently.
        </AppText>

        <AppButton label="Edit coupon" variant="outline" onPress={onEditPress} disabled={isDeleting} />
        <AppButton
          label={isDeleting ? 'Deleting coupon...' : 'Delete coupon'}
          variant="outline"
          loading={isDeleting}
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
