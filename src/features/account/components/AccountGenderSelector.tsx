import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import { GENDER_OPTIONS } from '../utils/accountDetailsForm';

interface AccountGenderSelectorProps {
  value: string;
  onChange: (nextValue: string) => void;
  error?: string;
  tone?: 'default' | 'surface';
}

export function AccountGenderSelector({
  value,
  onChange,
  error,
  tone = 'default',
}: AccountGenderSelectorProps) {
  const isSurfaceTone = tone === 'surface';

  return (
    <View style={styles.container}>
      <AppText variant="label" style={isSurfaceTone ? styles.labelSurface : undefined}>
        Gender
      </AppText>
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
                isSurfaceTone && styles.optionSurface,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="bodySmall"
                color={selected ? 'textInverse' : isSurfaceTone ? 'textPrimary' : 'textSecondary'}
                style={selected ? styles.selectedLabel : isSurfaceTone ? styles.surfaceLabel : undefined}
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
  labelSurface: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.borderForm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionSurface: {
    borderColor: colors.borderForm,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedLabel: {
    fontWeight: '600',
  },
  surfaceLabel: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
