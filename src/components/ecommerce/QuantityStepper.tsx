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
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled: boolean;
  compact: boolean;
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
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <AppText
        variant="bodyMedium"
        color={disabled ? 'disabledText' : 'primary'}
        style={[styles.buttonLabel, compact && styles.buttonLabelCompact]}
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
    backgroundColor: colors.surface,
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
  buttonLabelCompact: {
    fontSize: 14,
    lineHeight: 18,
  },
  value: {
    minWidth: 40,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  valueCompact: {
    minWidth: 24,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: spacing.xs,
  },
});
