import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, radius, spacing } from '../../../design-system';

export interface ProductDetailCompactStepperProps {
  value: number;
  min?: number;
  max?: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

function StepperButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  filled,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
  filled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? styles.buttonFilled : styles.buttonMuted,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <AppText
        variant="bodyMedium"
        style={[styles.buttonLabel, filled ? styles.buttonLabelFilled : undefined]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function ProductDetailCompactStepper({
  value,
  min = 1,
  max,
  onDecrement,
  onIncrement,
  disabled = false,
  style,
}: ProductDetailCompactStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <View style={[styles.container, style]}>
      <StepperButton
        label="−"
        accessibilityLabel="Decrease quantity"
        onPress={onDecrement}
        disabled={disabled || atMin}
      />
      <AppText variant="bodyMedium" style={styles.value}>
        {value}
      </AppText>
      <StepperButton
        label="+"
        accessibilityLabel="Increase quantity"
        onPress={onIncrement}
        disabled={disabled || atMax}
        filled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.disabledBg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMuted: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonFilled: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  buttonLabelFilled: {
    color: colors.textInverse,
  },
  value: {
    minWidth: layout.minTouchTarget - 12,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.9,
  },
});
