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
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onDecrement,
  onIncrement,
  disabled = false,
  size = 'default',
  style,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  const isCompact = size === 'compact';

  return (
    <View style={[styles.container, isCompact && styles.containerCompact, style]}>
      <StepperButton
        label="−"
        accessibilityLabel="Decrease quantity"
        onPress={onDecrement}
        disabled={disabled || atMin}
        compact={isCompact}
        decrement
      />
      <AppText variant="bodyMedium" style={[styles.value, isCompact && styles.valueCompact]}>
        {value}
      </AppText>
      <StepperButton
        label="+"
        accessibilityLabel="Increase quantity"
        onPress={onIncrement}
        disabled={disabled || atMax}
        compact={isCompact}
        filled
      />
    </View>
  );
}

function StepperButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  compact,
  filled,
  decrement,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
  compact: boolean;
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
        compact && styles.buttonCompact,
        compact && filled && styles.buttonCompactFilled,
        compact && decrement && styles.buttonCompactDecrement,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <AppText
        variant="bodyMedium"
        style={[
          styles.buttonLabel,
          compact && styles.buttonLabelCompact,
          compact && filled && !disabled && styles.buttonLabelFilled,
          compact && decrement && !disabled && styles.buttonLabelDecrement,
          !compact && decrement && !disabled && styles.buttonLabelDecrement,
          !compact && !decrement && !disabled && styles.buttonLabelDefault,
          disabled && styles.buttonLabelDisabled,
        ]}
      >
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
  containerCompact: {
    borderRadius: radius.pill,
    backgroundColor: colors.disabledBg,
    borderColor: colors.border,
  },
  button: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  buttonCompact: {
    minWidth: 28,
    minHeight: 28,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  buttonCompactDecrement: {
    backgroundColor: colors.surfaceWhite,
  },
  buttonCompactFilled: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceWhite,
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  buttonLabelCompact: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  buttonLabelFilled: {
    color: colors.textInverse,
  },
  buttonLabelDecrement: {
    color: colors.error,
  },
  buttonLabelDefault: {
    color: colors.primary,
  },
  buttonLabelDisabled: {
    color: colors.disabledText,
  },
  value: {
    minWidth: 40,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
  },
  valueCompact: {
    minWidth: 24,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
  },
});
