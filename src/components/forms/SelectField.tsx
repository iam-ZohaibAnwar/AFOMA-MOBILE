import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../ui/AppText';
import { colors, radius, spacing } from '../../design-system';
import type { SelectOption } from '../../utils/regionOptions';

export interface SelectFieldProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  modalTitle?: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  disabled = false,
  containerStyle,
  modalTitle,
}: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? '',
    [options, value],
  );

  const displayValue = selectedLabel || value;

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        {label ? <AppText variant="label">{label}</AppText> : null}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.trigger,
            error ? styles.triggerError : null,
            disabled ? styles.triggerDisabled : null,
            pressed && !disabled ? styles.pressed : null,
          ]}
        >
          <AppText
            variant="body"
            color={displayValue ? 'textPrimary' : 'textSubtle'}
            numberOfLines={1}
            style={styles.triggerText}
          >
            {displayValue || placeholder}
          </AppText>
          <AppText variant="bodyMedium" color="textMuted">
            ▾
          </AppText>
        </Pressable>
        {error ? (
          <AppText variant="caption" color="error">
            {error}
          </AppText>
        ) : null}
      </View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.sheetHeader}>
            <AppText variant="bodyMedium" style={styles.sheetTitle}>
              {modalTitle ?? label ?? 'Select'}
            </AppText>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
              <AppText variant="bodyMedium" color="textLink">
                Close
              </AppText>
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsList}
            renderItem={({ item }) => {
              const selected = item.value === value;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    variant="body"
                    color={selected ? 'textLink' : 'textPrimary'}
                    style={selected ? styles.optionLabelSelected : undefined}
                  >
                    {item.label}
                  </AppText>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <AppText variant="bodySmall" color="textMuted">
                  No options available
                </AppText>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.small,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
  },
  triggerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  triggerDisabled: {
    backgroundColor: colors.disabledBg,
  },
  pressed: {
    opacity: 0.9,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  optionsList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  optionRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  optionRowSelected: {
    backgroundColor: colors.primarySoft,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.small,
    borderBottomColor: 'transparent',
  },
  optionLabelSelected: {
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
