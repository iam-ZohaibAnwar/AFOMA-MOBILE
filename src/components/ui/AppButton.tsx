import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';

type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type AppButtonSize = 'md' | 'lg';
type AppButtonShape = 'default' | 'pill';

export interface AppButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  shape?: AppButtonShape;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  shape = 'default',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  labelStyle,
  ...pressableProps
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        shape === 'pill' ? styles.shape_pill : styles.shape_default,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? colors.textInverse : colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`label_${variant}`], labelStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xl,
  },
  shape_default: {
    borderRadius: radius.small,
  },
  shape_pill: {
    borderRadius: radius.pill,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  size_md: {
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  size_lg: {
    minHeight: 48,
    paddingVertical: spacing.md,
  },
  variant_primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  variant_outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  label: {
    ...typography.button,
  },
  label_primary: {
    color: colors.textInverse,
  },
  label_secondary: {
    color: colors.textInverse,
  },
  label_outline: {
    color: colors.primary,
  },
  label_ghost: {
    color: colors.primary,
  },
});
