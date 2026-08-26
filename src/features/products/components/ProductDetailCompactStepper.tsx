import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius } from '../../../design-system';

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
  decrement,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
  filled?: boolean;
  decrement?: boolean;
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
        variant="bodySmall"
        style={[
          styles.buttonLabel,
          filled ? styles.buttonLabelFilled : undefined,
          decrement && !disabled && styles.buttonLabelDecrement,
        ]}
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
        decrement
      />
      <AppText variant="bodySmall" style={styles.value}>
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

const STEPPER_BUTTON_SIZE = 28;
const STEPPER_PADDING = 3;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.disabledBg,
    padding: STEPPER_PADDING,
    gap: STEPPER_PADDING,
  },
  button: {
    width: STEPPER_BUTTON_SIZE,
    height: STEPPER_BUTTON_SIZE,
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
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  buttonLabelFilled: {
    color: colors.textInverse,
  },
  buttonLabelDecrement: {
    color: colors.error,
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.9,
  },
});
