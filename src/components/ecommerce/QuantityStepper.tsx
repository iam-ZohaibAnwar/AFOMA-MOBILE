import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, layout, radius, spacing } from '../../design-system';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrement,
  onIncrement,
  disabled = false,
  style,
}: QuantityStepperProps) {
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
      />
    </View>
  );
}

function StepperButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
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
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <AppText variant="bodyMedium" color={disabled ? 'disabledText' : 'primary'} style={styles.buttonLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  button: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  value: {
    minWidth: 40,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
