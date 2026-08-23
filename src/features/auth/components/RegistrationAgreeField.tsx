import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface RegistrationAgreeFieldProps {
  value: boolean;
  onChange: (next: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function RegistrationAgreeField({
  value,
  onChange,
  error,
  disabled = false,
}: RegistrationAgreeFieldProps) {
  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value }}
        disabled={disabled}
        onPress={() => onChange(!value)}
        style={({ pressed }) => [styles.row, pressed && !disabled ? styles.pressed : null]}
      >
        <View style={[styles.checkbox, value && styles.checkboxSelected]}>
          {value ? (
            <AppText variant="caption" color="textInverse" style={styles.checkmark}>
              ✓
            </AppText>
          ) : null}
        </View>
        <AppText variant="bodySmall" color="textSecondary" style={styles.label}>
          I agree to the Terms & Conditions and Privacy Policy
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.small,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontWeight: '700',
    lineHeight: 14,
  },
  label: {
    flex: 1,
    lineHeight: 20,
  },
});
