import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminProductDetail } from '../types/adminProductManagement';
import {
  formatAdminProductApprovalStatus,
} from '../utils/adminProductDisplay';
import {
  isAdminProductActive,
} from '../utils/adminProductOperations';
import { AdminProductDetailCardShell } from './detail/AdminProductDetailCardShell';

export interface AdminProductDetailOperationsCardProps {
  product: AdminProductDetail;
  isUpdatingApproval: boolean;
  isUpdatingVisibility: boolean;
  onApprovalChange: (productStatus: string) => void;
  onEnablePress: () => void;
  onDisablePress: () => void;
}

export function AdminProductDetailOperationsCard({
  product,
  isUpdatingApproval,
  isUpdatingVisibility,
  onApprovalChange,
  onEnablePress,
  onDisablePress,
}: AdminProductDetailOperationsCardProps) {
  const currentApproval = product.productStatus?.trim() ?? '';
  const approvalLabel = formatAdminProductApprovalStatus(currentApproval);
  const isActive = isAdminProductActive(product.status);
  const visibilityLabel = isActive ? 'Visible in search & browse' : 'Hidden from storefront';
  const isBusy = isUpdatingApproval || isUpdatingVisibility;
  const canRevoke = currentApproval === 'Approved';

  const handleRevokePress = () => {
    Alert.alert(
      'Revoke approval?',
      'This will mark the product as Disapproved. Store visibility stays unchanged.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => onApprovalChange('Disapproved'),
        },
      ],
    );
  };

  const handleFlagPress = () => {
    if (currentApproval === 'Review') {
      return;
    }

    Alert.alert(
      'Flag for manual review?',
      'This moves the product into the Review queue for admin inspection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Flag', onPress: () => onApprovalChange('Review') },
      ],
    );
  };

  const handleVisibilityToggle = (nextValue: boolean) => {
    if (nextValue) {
      onEnablePress();
      return;
    }

    onDisablePress();
  };

  return (
    <AdminProductDetailCardShell title="Product Operations" icon="shield-outline" accent>
      <View style={styles.operationRow}>
        <View style={styles.operationCopy}>
          <AppText variant="bodyMedium" style={styles.operationTitle}>
            Approval Status
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Currently {approvalLabel}
          </AppText>
        </View>

        {canRevoke ? (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={handleRevokePress}
            style={({ pressed }) => [styles.revokeButton, pressed && styles.buttonPressed]}
          >
            <AppText variant="bodySmall" style={styles.revokeLabel}>
              Revoke
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.operationRow}>
        <View style={styles.operationCopy}>
          <AppText variant="bodyMedium" style={styles.operationTitle}>
            Visibility
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            {visibilityLabel}
          </AppText>
        </View>

        <Switch
          value={isActive}
          onValueChange={handleVisibilityToggle}
          disabled={isBusy}
          trackColor={{ false: colors.borderStrong, true: colors.primarySoft }}
          thumbColor={isActive ? colors.primary : colors.surface}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isBusy || currentApproval === 'Review'}
        onPress={handleFlagPress}
        style={({ pressed }) => [
          styles.flagButton,
          (isBusy || currentApproval === 'Review') && styles.flagButtonDisabled,
          pressed && !isBusy && styles.buttonPressed,
        ]}
      >
        <Ionicons name="flag-outline" size={16} color={colors.error} />
        <AppText variant="bodySmall" style={styles.flagLabel}>
          Flag for Manual Review
        </AppText>
      </Pressable>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  operationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  operationCopy: {
    flex: 1,
    gap: 2,
  },
  operationTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  revokeButton: {
    borderWidth: 1,
    borderColor: colors.errorBg,
    backgroundColor: colors.errorBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  revokeLabel: {
    color: colors.error,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.errorBg,
    borderRadius: radius.large,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  flagButtonDisabled: {
    opacity: 0.5,
  },
  flagLabel: {
    color: colors.error,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
