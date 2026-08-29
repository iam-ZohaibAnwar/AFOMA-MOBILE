import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../../components/ui/AppButton';
import { AppText } from '../../../../../components/ui/AppText';
import { colors, spacing } from '../../../../../design-system';
import { AdminProductDetailCardShell } from '../../../product-management/components/detail/AdminProductDetailCardShell';

export interface AdminUserDetailOperationsCardProps {
  isDeleting: boolean;
  onEditPress: () => void;
  onDeletePress: () => void;
}

export function AdminUserDetailOperationsCard({
  isDeleting,
  onEditPress,
  onDeletePress,
}: AdminUserDetailOperationsCardProps) {
  return (
    <AdminProductDetailCardShell title="User Operations" icon="construct-outline" accent iconVariant="solid">
      <View style={styles.actions}>
        <AppButton label="Edit user" variant="primary" onPress={onEditPress} disabled={isDeleting} />

        <Pressable
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={onDeletePress}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
            isDeleting && styles.deleteButtonDisabled,
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <AppText variant="bodyMedium" style={styles.deleteLabel}>
              Delete user
            </AppText>
          )}
        </Pressable>
      </View>
    </AdminProductDetailCardShell>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  deleteButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteLabel: {
    color: colors.error,
    fontWeight: '600',
  },
});
