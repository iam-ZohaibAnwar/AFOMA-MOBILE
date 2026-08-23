import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminCommissionStatusMutation } from '../types/adminCommission';
import { normalizeAdminCommissionStatusMutation } from '../utils/adminCommissionFormatters';

const SHEET_HEIGHT_RATIO = 0.42;

export interface AdminCommissionStatusSheetProps {
  visible: boolean;
  currentStatus: string;
  isUpdating: boolean;
  onClose: () => void;
  onApply: (status: AdminCommissionStatusMutation) => void;
}

function StatusOptionRow({
  label,
  selected,
  isCurrent,
  onSelect,
}: {
  label: string;
  selected: boolean;
  isCurrent: boolean;
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
      <View style={styles.optionCopy}>
        <AppText variant="bodyMedium">{label}</AppText>
        {isCurrent ? (
          <AppText variant="caption" color="textSecondary">
            Current
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function AdminCommissionStatusSheet({
  visible,
  currentStatus,
  isUpdating,
  onClose,
  onApply,
}: AdminCommissionStatusSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const normalizedCurrent = normalizeAdminCommissionStatusMutation(currentStatus);
  const [draftStatus, setDraftStatus] = useState<AdminCommissionStatusMutation>(normalizedCurrent);

  useEffect(() => {
    if (visible) {
      setDraftStatus(normalizedCurrent);
    }
  }, [normalizedCurrent, visible]);

  const hasChanges = draftStatus !== normalizedCurrent;
  const applyLabel = isUpdating ? 'Updating...' : 'Apply';

  const subtitle = useMemo(() => {
    return `Current status: ${normalizedCurrent}`;
  }, [normalizedCurrent]);

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
          Payout status
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {subtitle}
        </AppText>

        <StatusOptionRow
          label="Pending"
          selected={draftStatus === 'Pending'}
          isCurrent={normalizedCurrent === 'Pending'}
          onSelect={() => setDraftStatus('Pending')}
        />
        <StatusOptionRow
          label="Paid"
          selected={draftStatus === 'Paid'}
          isCurrent={normalizedCurrent === 'Paid'}
          onSelect={() => setDraftStatus('Paid')}
        />

        <View style={styles.actions}>
          <AppButton label="Cancel" variant="ghost" onPress={onClose} disabled={isUpdating} />
          <AppButton
            label={applyLabel}
            disabled={!hasChanges || isUpdating}
            onPress={() => {
              onApply(draftStatus);
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
    gap: spacing.sm,
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
  optionCopy: {
    gap: spacing.xs,
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
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
