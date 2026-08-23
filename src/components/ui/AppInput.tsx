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
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({
  label,
  error,
  containerStyle,
  style,
  editable = true,
  ...inputProps
}: AppInputProps) {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSubtle}
        editable={editable}
        style={[
          styles.input,
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
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.small,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
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
