import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  tone?: 'default' | 'surface';
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({
  label,
  error,
  tone = 'default',
  containerStyle,
  style,
  editable = true,
  ...inputProps
}: AppInputProps) {
  const hasError = Boolean(error);
  const isSurfaceTone = tone === 'surface';

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, isSurfaceTone && styles.labelSurface]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSubtle}
        editable={editable}
        style={[
          styles.input,
          isSurfaceTone && styles.inputSurface,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
          style,
        ]}
        {...inputProps}
      />
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
  },
  labelSurface: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderForm,
    borderRadius: radius.small,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    minHeight: 48,
  },
  inputSurface: {
    backgroundColor: colors.surface,
    borderColor: colors.borderForm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  inputDisabled: {
    backgroundColor: colors.disabledBg,
    color: colors.disabledText,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
});

