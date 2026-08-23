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
import type {
  AdminProductApprovalFilter,
  AdminProductInventoryFilter,
} from '../types/adminProductManagement';
import {
  ADMIN_PRODUCT_APPROVAL_FILTERS,
  ADMIN_PRODUCT_INVENTORY_FILTERS,
} from '../utils/adminProductDisplay';

const SHEET_HEIGHT_RATIO = 0.72;

export interface AdminProductFiltersSheetProps {
  visible: boolean;
  approvalFilter: AdminProductApprovalFilter;
  inventoryFilter: AdminProductInventoryFilter;
  onClose: () => void;
  onApply: (
    approvalFilter: AdminProductApprovalFilter,
    inventoryFilter: AdminProductInventoryFilter,
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
      style={({ pressed }) => [styles.optionRow, pressed && styles.optionPressed]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <AppText variant="bodyMedium">{label}</AppText>
    </Pressable>
  );
}

export function AdminProductFiltersSheet({
  visible,
  approvalFilter,
  inventoryFilter,
  onClose,
  onApply,
  onClear,
}: AdminProductFiltersSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [draftApproval, setDraftApproval] = useState<AdminProductApprovalFilter>(approvalFilter);
  const [draftInventory, setDraftInventory] = useState<AdminProductInventoryFilter>(inventoryFilter);

  useEffect(() => {
    if (visible) {
      setDraftApproval(approvalFilter);
      setDraftInventory(inventoryFilter);
    }
  }, [approvalFilter, inventoryFilter, visible]);

  const sheetHeight = useMemo(() => height * SHEET_HEIGHT_RATIO, [height]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { height: sheetHeight, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Filter products
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
            Approval and store visibility are independent filters.
          </AppText>

          <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              Approval
            </AppText>
            {ADMIN_PRODUCT_APPROVAL_FILTERS.map((option) => (
              <FilterOptionRow
                key={`approval-${option.label}`}
                label={option.label}
                selected={draftApproval === option.value}
                onSelect={() => setDraftApproval(option.value)}
              />
            ))}

            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              Store visibility
            </AppText>
            {ADMIN_PRODUCT_INVENTORY_FILTERS.map((option) => (
              <FilterOptionRow
                key={`inventory-${option.label}`}
                label={option.label}
                selected={draftInventory === option.value}
                onSelect={() => setDraftInventory(option.value)}
              />
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton label="Clear" variant="outline" onPress={onClear} />
            <AppButton
              label="Apply"
              onPress={() => {
                onApply(draftApproval, draftInventory);
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
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
