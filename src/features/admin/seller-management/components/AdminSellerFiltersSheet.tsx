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
import type { AdminSellerApprovalFilter, AdminSellerShopFilter } from '../types/adminSellerManagement';

const SHEET_HEIGHT_RATIO = 0.62;

const APPROVAL_OPTIONS: Array<{ value: AdminSellerApprovalFilter; label: string }> = [
  { value: '', label: 'All approval statuses' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Disapproved', label: 'Disapproved' },
];

const SHOP_VISIBILITY_OPTIONS: Array<{ value: AdminSellerShopFilter; label: string }> = [
  { value: '', label: 'All shop visibility' },
  { value: 'Active', label: 'Visible' },
  { value: 'Inactive', label: 'Hidden' },
];

export interface AdminSellerFiltersSheetProps {
  visible: boolean;
  approvalFilter: AdminSellerApprovalFilter;
  shopVisibilityFilter: AdminSellerShopFilter;
  onClose: () => void;
  onApply: (approval: AdminSellerApprovalFilter, shop: AdminSellerShopFilter) => void;
  onClear: () => void;
}

function FilterOptionRow<T extends string>({
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

export function AdminSellerFiltersSheet({
  visible,
  approvalFilter,
  shopVisibilityFilter,
  onClose,
  onApply,
  onClear,
}: AdminSellerFiltersSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);

  const [draftApproval, setDraftApproval] = useState<AdminSellerApprovalFilter>(approvalFilter);
  const [draftShop, setDraftShop] = useState<AdminSellerShopFilter>(shopVisibilityFilter);

  useEffect(() => {
    if (visible) {
      setDraftApproval(approvalFilter);
      setDraftShop(shopVisibilityFilter);
    }
  }, [approvalFilter, shopVisibilityFilter, visible]);

  const hasDraftFilters = useMemo(
    () => Boolean(draftApproval || draftShop),
    [draftApproval, draftShop],
  );

  const handleApply = () => {
    onApply(draftApproval, draftShop);
    onClose();
  };

  const handleClear = () => {
    setDraftApproval('');
    setDraftShop('');
    onClear();
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close filters" style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <View style={styles.handle} />

          <AppText variant="h3" style={styles.title}>
            Filter sellers
          </AppText>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              Approval status
            </AppText>
            {APPROVAL_OPTIONS.map((option) => (
              <FilterOptionRow
                key={`approval-${option.value || 'all'}`}
                label={option.label}
                selected={draftApproval === option.value}
                onSelect={() => setDraftApproval(option.value)}
              />
            ))}

            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              Shop visibility
            </AppText>
            {SHOP_VISIBILITY_OPTIONS.map((option) => (
              <FilterOptionRow
                key={`shop-${option.value || 'all'}`}
                label={option.label}
                selected={draftShop === option.value}
                onSelect={() => setDraftShop(option.value)}
              />
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <AppButton
              label="Clear filters"
              variant="secondary"
              onPress={handleClear}
              disabled={!hasDraftFilters && !approvalFilter && !shopVisibilityFilter}
            />
            <AppButton label="Apply filters" onPress={handleApply} />
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
    backgroundColor: colors.overlay,
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
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  scrollContent: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
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
    backgroundColor: colors.surfaceMuted,
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
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
  },
});
