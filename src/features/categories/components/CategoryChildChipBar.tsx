import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface CategoryChildChipOption {
  id: string;
  label: string;
}

export interface CategoryChildChipBarProps {
  options: CategoryChildChipOption[];
  activeOptionId: string;
  onOptionChange: (optionId: string) => void;
}

export function CategoryChildChipBar({
  options,
  activeOptionId,
  onOptionChange,
}: CategoryChildChipBarProps) {
  if (options.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => {
        const isActive = option.id === activeOptionId;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onOptionChange(option.id)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <AppText
              variant="bodySmall"
              style={[styles.chipLabel, isActive && styles.chipLabelActive]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: colors.textInverse,
  },
});
