import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import {
  formatAdminSellerDob,
  formatAdminSellerField,
  formatAdminSellerGender,
} from '../utils/adminSellerBasicInfo';

export interface AdminSellerBasicInfoReadOnlyProps {
  seller: AdminSellerListItem;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyMedium">{value}</AppText>
    </View>
  );
}

export function AdminSellerBasicInfoReadOnly({ seller }: AdminSellerBasicInfoReadOnlyProps) {
  return (
    <View style={styles.container}>
      <ReadOnlyField label="First name" value={formatAdminSellerField(seller.firstName)} />
      <ReadOnlyField label="Last name" value={formatAdminSellerField(seller.lastName)} />
      <ReadOnlyField label="Email" value={formatAdminSellerField(seller.email)} />
      <ReadOnlyField label="Gender" value={formatAdminSellerGender(seller.gender)} />
      <ReadOnlyField label="Date of birth" value={formatAdminSellerDob(seller.DOB)} />
      <ReadOnlyField label="Contact number" value={formatAdminSellerField(seller.phone)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
});
