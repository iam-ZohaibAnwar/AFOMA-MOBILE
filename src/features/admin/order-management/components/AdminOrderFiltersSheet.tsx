import { useEffect, useMemo, useState } from 'react';
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
import type { AdminOrderStatusFilter } from '../types/adminOrderManagement';
import { ADMIN_ORDER_STATUS_FILTERS } from '../utils/adminOrderDisplay';

const SHEET_HEIGHT_RATIO = 0.55;

export interface AdminOrderFiltersSheetProps {
  visible: boolean;
  statusFilter: AdminOrderStatusFilter;
  onClose: () => void;
  onApply: (status: AdminOrderStatusFilter) => void;
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
      style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <AppText variant="bodyMedium">{label}</AppText>
    </Pressable>
  );
}

export function AdminOrderFiltersSheet({
  visible,
  statusFilter,
  onClose,
  onApply,
  onClear,
}: AdminOrderFiltersSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [draftStatus, setDraftStatus] = useState<AdminOrderStatusFilter>(statusFilter);

  useEffect(() => {
    if (visible) {
      setDraftStatus(statusFilter);
    }
  }, [statusFilter, visible]);

  const sheetHeight = useMemo(() => height * SHEET_HEIGHT_RATIO, [height]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Filter orders
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
            Status filter uses backend values as returned by the API.
          </AppText>

          <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
            {ADMIN_ORDER_STATUS_FILTERS.map((option) => (
              <FilterOptionRow
                key={option.label}
                label={option.label}
                selected={draftStatus === option.value}
                onSelect={() => setDraftStatus(option.value)}
              />
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Clear" variant="outline" onPress={onClear} />
            <AppButton
              label="Apply"
              onPress={() => {
                onApply(draftStatus);
                onClose();
              }}
            />
          </View>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  options: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  optionPressed: {
    opacity: 0.85,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
