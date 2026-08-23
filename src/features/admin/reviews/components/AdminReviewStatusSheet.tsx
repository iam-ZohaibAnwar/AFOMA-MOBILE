import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { ADMIN_REVIEW_STATUSES, type AdminReviewStatus } from '../types/adminReviews';
import { formatAdminReviewStatus } from '../utils/adminReviewsContent';

const SHEET_HEIGHT_RATIO = 0.48;

export interface AdminReviewStatusSheetProps {
  visible: boolean;
  currentStatus: string;
  isUpdating: boolean;
  error?: string | null;
  onDismiss: () => void;
  onApply: (nextStatus: AdminReviewStatus) => void;
  onClearError: () => void;
}

function StatusOptionRow({
  label,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.optionRow,
        selected && styles.optionRowSelected,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <AppText variant="bodyMedium">{label}</AppText>
    </Pressable>
  );
}

export function AdminReviewStatusSheet({
  visible,
  currentStatus,
  isUpdating,
  error,
  onDismiss,
  onApply,
  onClearError,
}: AdminReviewStatusSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);

  const normalizedCurrent = formatAdminReviewStatus(currentStatus);
  const resolvedCurrent = ADMIN_REVIEW_STATUSES.includes(normalizedCurrent as AdminReviewStatus)
    ? (normalizedCurrent as AdminReviewStatus)
    : 'Pending';

  const [draftStatus, setDraftStatus] = useState<AdminReviewStatus>(resolvedCurrent);

  useEffect(() => {
    if (visible) {
      setDraftStatus(resolvedCurrent);
      onClearError();
    }
  }, [onClearError, resolvedCurrent, visible]);

  const isUnchanged = draftStatus === resolvedCurrent;

  const applyDisabled = useMemo(
    () => isUpdating || isUnchanged,
    [isUnchanged, isUpdating],
  );

  const handleApply = () => {
    if (applyDisabled) {
      return;
    }

    onApply(draftStatus);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close status sheet"
          style={styles.backdrop}
          onPress={onDismiss}
        />

        <View
          style={[
            styles.sheet,
            { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <View style={styles.handle} />

          <AppText variant="h3" style={styles.title}>
            Moderate review
          </AppText>

          <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
            Current status: {formatAdminReviewStatus(resolvedCurrent)}
          </AppText>

          <View style={styles.options}>
            {ADMIN_REVIEW_STATUSES.map((status) => (
              <StatusOptionRow
                key={status}
                label={status}
                selected={draftStatus === status}
                disabled={isUpdating}
                onSelect={() => {
                  onClearError();
                  setDraftStatus(status);
                }}
              />
            ))}
          </View>

          {isUpdating ? (
            <AppText variant="bodySmall" color="textSecondary" style={styles.updatingCopy}>
              Updating…
            </AppText>
          ) : null}

          {error ? (
            <AppText variant="caption" color="error" style={styles.errorCopy}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <AppButton label="Cancel" variant="secondary" onPress={onDismiss} disabled={isUpdating} />
            <AppButton
              label="Apply"
              onPress={handleApply}
              loading={isUpdating}
              disabled={applyDisabled}
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
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  options: {
    gap: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.medium,
  },
  optionRowSelected: {
    backgroundColor: colors.background,
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
  updatingCopy: {
    marginTop: -spacing.xs,
  },
  errorCopy: {
    marginTop: -spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.85,
  },
});
