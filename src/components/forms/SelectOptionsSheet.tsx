import { useMemo } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../ui/AppText';
import { colors, radius, spacing } from '../../design-system';
import type { SelectOption } from '../../utils/regionOptions';

export interface SelectOptionsSheetProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  emptyLabel?: string;
  selectionAccent?: 'primary' | 'navy';
  isOptionDisabled?: (option: SelectOption) => boolean;
}

export function SelectOptionsSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  emptyLabel = 'No options available',
  selectionAccent = 'primary',
  isOptionDisabled,
}: SelectOptionsSheetProps) {
  const insets = useSafeAreaInsets();
  const useNavySelection = selectionAccent === 'navy';

  const sheetPaddingBottom = useMemo(
    () => Math.max(insets.bottom, spacing.lg),
    [insets.bottom],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: sheetPaddingBottom }]}>
        <View style={styles.sheetHeader}>
          <AppText variant="bodyMedium" style={styles.sheetTitle}>
            {title}
          </AppText>
          <Pressable accessibilityRole="button" onPress={onClose}>
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
            const optionDisabled = isOptionDisabled?.(item) ?? false;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: optionDisabled }}
                disabled={optionDisabled}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.optionRow,
                  selected && (useNavySelection ? styles.optionRowSelectedNavy : styles.optionRowSelected),
                  optionDisabled && styles.optionRowDisabled,
                  pressed && !optionDisabled && styles.pressed,
                ]}
              >
                <AppText
                  variant="body"
                  color={
                    optionDisabled
                      ? 'textSubtle'
                      : selected
                        ? useNavySelection
                          ? 'textPrimary'
                          : 'textLink'
                        : 'textPrimary'
                  }
                  style={[
                    selected && !optionDisabled ? styles.optionLabelSelected : undefined,
                    optionDisabled ? styles.optionLabelDisabled : undefined,
                  ]}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <AppText variant="bodySmall" color="textMuted">
                {emptyLabel}
              </AppText>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  optionRowSelectedNavy: {
    backgroundColor: colors.disabledBg,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.small,
    borderBottomColor: 'transparent',
  },
  optionLabelSelected: {
    fontWeight: '600',
  },
  optionRowDisabled: {
    opacity: 0.55,
  },
  optionLabelDisabled: {
    textDecorationLine: 'line-through',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
