import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface SellerAttributeRowProps {
  name: string;
  index: number;
  onRename: () => void;
  onDelete: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
}

export function SellerAttributeRow({
  name,
  onRename,
  onDelete,
  isRenaming = false,
  isDeleting = false,
  disabled = false,
  showDivider = true,
}: SellerAttributeRowProps) {
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
            accessibilityLabel={`Rename ${name}`}
            disabled={disabled || isBusy}
            onPress={onRename}
            style={({ pressed }) => [styles.iconButton, pressed && !disabled ? styles.pressed : null]}
            hitSlop={8}
          >
            <AppText variant="bodyMedium" style={styles.icon}>
              ✎
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
            style={({ pressed }) => [styles.iconButton, pressed && !disabled ? styles.pressed : null]}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
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
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  icon: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 22,
  },
  spinner: {
    width: 36,
    height: 36,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
