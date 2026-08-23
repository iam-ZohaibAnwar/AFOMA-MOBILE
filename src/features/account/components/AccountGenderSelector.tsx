import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import { GENDER_OPTIONS } from '../utils/accountDetailsForm';

interface AccountGenderSelectorProps {
  value: string;
  onChange: (nextValue: string) => void;
  error?: string;
}

export function AccountGenderSelector({ value, onChange, error }: AccountGenderSelectorProps) {
  return (
    <View style={styles.container}>
      <AppText variant="label">Gender</AppText>
      <View style={styles.optionsRow}>
        {GENDER_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="bodySmall"
                color={selected ? 'textInverse' : 'textSecondary'}
                style={selected ? styles.selectedLabel : undefined}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedLabel: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
