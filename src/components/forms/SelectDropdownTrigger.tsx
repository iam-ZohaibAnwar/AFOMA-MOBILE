import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, radius, spacing } from '../../design-system';

export interface SelectDropdownTriggerProps {
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  tone?: 'default' | 'surface';
  containerStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
}

export function SelectDropdownTrigger({
  label,
  value,
  placeholder = 'Select',
  error,
  disabled = false,
  tone = 'default',
  containerStyle,
  onPress,
}: SelectDropdownTriggerProps) {
  const isSurfaceTone = tone === 'surface';
  const displayValue = value.trim();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" style={isSurfaceTone ? styles.labelSurface : undefined}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.trigger,
          isSurfaceTone && styles.triggerSurface,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
          pressed && !disabled ? styles.pressed : null,
        ]}
      >
        <AppText
          variant="body"
          color={displayValue ? 'textPrimary' : 'textSubtle'}
          numberOfLines={1}
          style={[styles.triggerText, isSurfaceTone && styles.triggerTextSurface]}
        >
          {displayValue || placeholder}
        </AppText>
        <AppText variant="bodyMedium" color="textMuted">
          ▾
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
  container: {
    gap: spacing.sm,
  },
  labelSurface: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderForm,
    borderRadius: radius.small,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
  },
  triggerSurface: {
    backgroundColor: colors.surface,
    borderColor: colors.borderForm,
  },
  triggerTextSurface: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  triggerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  triggerDisabled: {
    backgroundColor: colors.disabledBg,
  },
  pressed: {
    opacity: 0.9,
  },
});
