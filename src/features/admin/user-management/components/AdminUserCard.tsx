import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminUserListItem } from '../types/adminUserManagement';
import {
  formatAdminUserDisplayName,
  formatAdminUserRoleLabel,
  getAdminUserFullAccessBadgeLabel,
} from '../utils/adminUserRoleOptions';

export interface AdminUserCardProps {
  user: AdminUserListItem;
  isDeleting: boolean;
  isDeleteBusy: boolean;
  onViewPress: (user: AdminUserListItem) => void;
  onEditPress: (user: AdminUserListItem) => void;
  onDeletePress: (user: AdminUserListItem) => void;
}

function roleBadgeVariant(role?: string): 'primary' | 'success' | 'warning' | 'neutral' {
  switch (role) {
    case 'admin':
      return 'warning';
    case 'seller':
      return 'success';
    case 'affiliate':
      return 'primary';
    default:
      return 'neutral';
  }
}

export function AdminUserCard({
  user,
  isDeleting,
  isDeleteBusy,
  onViewPress,
  onEditPress,
  onDeletePress,
}: AdminUserCardProps) {
  const userId = user._id;
  const actionsDisabled = !userId || isDeleting || isDeleteBusy;
  const fullAccessBadge = getAdminUserFullAccessBadgeLabel(user);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        disabled={!userId || isDeleteBusy}
        onPress={() => onViewPress(user)}
        style={({ pressed }) => [styles.mainPressable, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={styles.name}>
          {formatAdminUserDisplayName(user)}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
          {user.email ?? 'No email'}
        </AppText>

        <View style={styles.roleRow}>
          <AppBadge
            label={formatAdminUserRoleLabel(user.userRole)}
            variant={roleBadgeVariant(user.userRole)}
          />
          {fullAccessBadge ? (
            <AppBadge
              label={fullAccessBadge}
              variant={user.fullAccess ? 'warning' : 'neutral'}
            />
          ) : null}
        </View>
      </Pressable>

      <View style={styles.footer}>
        <AppButton
          label="Edit"
          variant="outline"
          disabled={actionsDisabled}
          onPress={() => onEditPress(user)}
        />
        <Pressable
          accessibilityRole="button"
          disabled={actionsDisabled}
          onPress={() => onDeletePress(user)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
            actionsDisabled && styles.disabled,
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <AppText variant="bodySmall" style={styles.deleteLabel}>
              Delete
            </AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  mainPressable: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    color: colors.textPrimary,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  deleteButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
});
