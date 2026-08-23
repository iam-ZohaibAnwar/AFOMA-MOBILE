import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface AdminProductBulkActionsBarProps {
  selectedCount: number;
  isUpdating: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onClearSelection: () => void;
}

export function AdminProductBulkActionsBar({
  selectedCount,
  isUpdating,
  onEnable,
  onDisable,
  onClearSelection,
}: AdminProductBulkActionsBarProps) {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <View style={styles.bar}>
      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.count}>
          Selected: {selectedCount}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          Bulk actions update store visibility only.
        </AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={isUpdating ? 'Updating...' : 'Enable'}
          variant="outline"
          disabled={isUpdating}
          onPress={onEnable}
          style={styles.actionButton}
        />
        <AppButton
          label={isUpdating ? 'Updating...' : 'Disable'}
          variant="outline"
          disabled={isUpdating}
          onPress={onDisable}
          style={styles.actionButton}
        />
        <AppButton
          label="Clear"
          variant="outline"
          disabled={isUpdating}
          onPress={onClearSelection}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  count: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 88,
  },
});
