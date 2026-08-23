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
import type {
  AdminCommissionPayoutStatusFilter,
  AdminCommissionRecipientRoleFilter,
} from '../types/adminCommission';
import {
  ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS,
  ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS,
} from '../utils/adminCommissionFilterOptions';

const SHEET_HEIGHT_RATIO = 0.62;

export interface AdminCommissionFiltersProps {
  visible: boolean;
  payoutStatusFilter: AdminCommissionPayoutStatusFilter;
  roleFilter: AdminCommissionRecipientRoleFilter;
  onClose: () => void;
  onApply: (
    payoutStatus: AdminCommissionPayoutStatusFilter,
    role: AdminCommissionRecipientRoleFilter,
  ) => void;
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

export function AdminCommissionFilters({
  visible,
  payoutStatusFilter,
  roleFilter,
  onClose,
  onApply,
  onClear,
}: AdminCommissionFiltersProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [draftPayoutStatus, setDraftPayoutStatus] =
    useState<AdminCommissionPayoutStatusFilter>(payoutStatusFilter);
  const [draftRole, setDraftRole] = useState<AdminCommissionRecipientRoleFilter>(roleFilter);

  useEffect(() => {
    if (visible) {
      setDraftPayoutStatus(payoutStatusFilter);
      setDraftRole(roleFilter);
    }
  }, [payoutStatusFilter, roleFilter, visible]);

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
          Filters
        </AppText>

        <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
          <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
            Payout status
          </AppText>
          {ADMIN_COMMISSION_PAYOUT_STATUS_FILTER_OPTIONS.map((option) => (
            <FilterOptionRow
              key={`payout-${option.label}`}
              label={option.label}
              selected={draftPayoutStatus === option.value}
              onSelect={() => setDraftPayoutStatus(option.value)}
            />
          ))}

          <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
            Role
          </AppText>
          {ADMIN_COMMISSION_RECIPIENT_ROLE_FILTER_OPTIONS.map((option) => (
            <FilterOptionRow
              key={`role-${option.label}`}
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
              onApply(draftPayoutStatus, draftRole);
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
  sectionLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
