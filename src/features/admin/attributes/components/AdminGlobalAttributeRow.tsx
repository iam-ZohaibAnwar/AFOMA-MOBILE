import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface AdminGlobalAttributeRowProps {
  name: string;
  rawIndex: number;
  onRename: () => void;
  onDelete: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
}

export function AdminGlobalAttributeRow({
  name,
  onRename,
  onDelete,
  isRenaming = false,
  isDeleting = false,
  disabled = false,
  showDivider = true,
}: AdminGlobalAttributeRowProps) {
  const isBusy = isRenaming || isDeleting;

  return (
    <View style={[styles.row, showDivider ? styles.rowDivider : null]}>
      <AppText variant="bodyMedium" style={styles.name} numberOfLines={2}>
        {name}
      </AppText>

      <View style={styles.actions}>
        {isRenaming ? (
          <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${name}`}
            disabled={disabled || isBusy}
            onPress={onRename}
            style={({ pressed }) => [styles.actionButton, pressed && !disabled ? styles.pressed : null]}
            hitSlop={8}
          >
            <AppText variant="bodySmall" color="textLink" style={styles.actionLabel}>
              Edit
            </AppText>
          </Pressable>
        )}

        {isDeleting ? (
          <ActivityIndicator size="small" color={colors.error} style={styles.spinner} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${name}`}
            disabled={disabled || isBusy}
            onPress={onDelete}
            style={({ pressed }) => [styles.actionButton, pressed && !disabled ? styles.pressed : null]}
            hitSlop={8}
          >
            <AppText variant="bodySmall" style={styles.deleteLabel}>
              Delete
            </AppText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 0,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
  },
  actionLabel: {
    fontWeight: '600',
  },
  deleteLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  spinner: {
    minWidth: 48,
    height: 28,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
