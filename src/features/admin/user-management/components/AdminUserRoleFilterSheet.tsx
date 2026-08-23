import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminUserRoleFilter } from '../types/adminUserManagement';
import { ADMIN_USER_ROLE_FILTER_OPTIONS } from '../utils/adminUserRoleOptions';

const SHEET_HEIGHT_RATIO = 0.48;

export interface AdminUserRoleFilterSheetProps {
  visible: boolean;
  roleFilter: AdminUserRoleFilter;
  onClose: () => void;
  onApply: (role: AdminUserRoleFilter) => void;
  onClear: () => void;
}

function FilterOptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={({ pressed }) => [styles.optionRow, selected && styles.optionRowSelected, pressed && styles.pressed]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <AppText variant="bodyMedium">{label}</AppText>
    </Pressable>
  );
}

export function AdminUserRoleFilterSheet({
  visible,
  roleFilter,
  onClose,
  onApply,
  onClear,
}: AdminUserRoleFilterSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [draftRole, setDraftRole] = useState<AdminUserRoleFilter>(roleFilter);

  useEffect(() => {
    if (visible) {
      setDraftRole(roleFilter);
    }
  }, [roleFilter, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />

      <View
        style={[
          styles.sheet,
          {
            maxHeight: sheetMaxHeight,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.handle} />

        <AppText variant="h3" style={styles.title}>
          User role
        </AppText>

        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          {ADMIN_USER_ROLE_FILTER_OPTIONS.map((option) => (
            <FilterOptionRow
              key={option.label}
              label={option.label}
              selected={draftRole === option.value}
              onSelect={() => setDraftRole(option.value)}
            />
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <AppButton label="Clear" variant="ghost" onPress={onClear} />
          <AppButton
            label="Apply"
            onPress={() => {
              onApply(draftRole);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.surface,
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
  },
  title: {
    color: colors.textPrimary,
  },
  options: {
    flexGrow: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.medium,
  },
  optionRowSelected: {
    backgroundColor: colors.background,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
