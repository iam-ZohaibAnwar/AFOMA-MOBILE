import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface SellerAttributeRowProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

export function SellerAttributeRow({
  name,
  onEdit,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  disabled = false,
}: SellerAttributeRowProps) {
  const isBusy = isUpdating || isDeleting;

  const handleDeletePress = () => {
    if (disabled || isBusy) {
      return;
    }

    Alert.alert(
      'Delete attribute',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  };

  return (
    <View style={styles.row}>
      <AppText variant="bodyMedium" style={styles.name} numberOfLines={2}>
        {name}
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label={isUpdating ? 'Saving...' : 'Edit'}
          variant="outline"
          size="md"
          loading={isUpdating}
          disabled={disabled || isBusy}
          onPress={onEdit}
          style={styles.actionButton}
        />
        <AppButton
          label={isDeleting ? 'Deleting...' : 'Delete'}
          variant="outline"
          size="md"
          loading={isDeleting}
          disabled={disabled || isBusy}
          onPress={handleDeletePress}
          style={styles.actionButton}
          labelStyle={styles.deleteLabel}
        />
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
  actionButton: {
    minWidth: 84,
  },
  deleteLabel: {
    color: colors.error,
  },
});
