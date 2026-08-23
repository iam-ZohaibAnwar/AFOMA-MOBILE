import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../../components/forms';
import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import type { AdminSellerApprovalChoice } from '../types/adminSellerManagement';
import { formatAdminSellerApprovalStatus } from '../utils/adminSellerDisplay';

const APPROVAL_OPTIONS: Array<{ value: AdminSellerApprovalChoice; label: string }> = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Disapproved', label: 'Disapproved' },
];

export interface AdminSellerApprovalControlProps {
  value?: string;
  isUpdating: boolean;
  error?: string | null;
  onChange: (nextStatus: AdminSellerApprovalChoice) => void;
}

export function AdminSellerApprovalControl({
  value,
  isUpdating,
  error,
  onChange,
}: AdminSellerApprovalControlProps) {
  const currentValue = (formatAdminSellerApprovalStatus(value) as AdminSellerApprovalChoice) || 'Pending';

  return (
    <View style={styles.container}>
      <AppText variant="label">Approval status</AppText>
      <AppText variant="caption" color="textSecondary">
        Changes apply immediately and are separate from basic information saves.
      </AppText>

      {isUpdating ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <AppText variant="bodySmall" color="textSecondary">
            Updating approval...
          </AppText>
        </View>
      ) : (
        <SelectField
          value={currentValue}
          options={APPROVAL_OPTIONS}
          onChange={(nextValue) => onChange(nextValue as AdminSellerApprovalChoice)}
          modalTitle="Change approval status"
          placeholder="Select approval status"
          disabled={isUpdating}
        />
      )}

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
