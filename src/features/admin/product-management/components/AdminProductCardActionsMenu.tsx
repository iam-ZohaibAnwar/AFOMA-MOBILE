import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export type AdminProductCardActionId =
  | 'delete'
  | 'disable'
  | 'enable'
  | 'view'
  | 'edit'
  | 'editVariations'
  | 'preview'
  | 'duplicate';

export interface AdminProductCardAction {
  id: AdminProductCardActionId;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface AdminProductCardActionsMenuProps {
  visible: boolean;
  productName?: string;
  actions: AdminProductCardAction[];
  onClose: () => void;
  onSelect: (actionId: AdminProductCardActionId) => void;
}

export function AdminProductCardActionsMenu({
  visible,
  productName,
  actions,
  onClose,
  onSelect,
}: AdminProductCardActionsMenuProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          {productName ? (
            <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
              {productName}
            </AppText>
          ) : null}

          <View style={styles.menu}>
            {actions.map((action, index) => (
              <Pressable
                key={action.id}
                accessibilityRole="menuitem"
                disabled={action.disabled}
                onPress={() => onSelect(action.id)}
                style={({ pressed }) => [
                  styles.menuItem,
                  index > 0 && styles.menuItemBorder,
                  action.disabled && styles.menuItemDisabled,
                  pressed && !action.disabled && styles.menuItemPressed,
                ]}
              >
                <AppText
                  variant="bodyMedium"
                  style={[
                    styles.menuLabel,
                    action.destructive && styles.menuLabelDestructive,
                    action.disabled && styles.menuLabelDisabled,
                  ]}
                >
                  {action.label}
                </AppText>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.menuItemPressed]}
          >
            <AppText variant="bodyMedium" style={styles.cancelLabel}>
              Cancel
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    zIndex: 2,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  menu: {
    borderRadius: radius.large,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  menuItem: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  menuItemBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  menuItemPressed: {
    backgroundColor: colors.primarySoft,
  },
  menuItemDisabled: {
    opacity: 0.45,
  },
  menuLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  menuLabelDestructive: {
    color: colors.error,
  },
  menuLabelDisabled: {
    color: colors.textMuted,
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  cancelLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
