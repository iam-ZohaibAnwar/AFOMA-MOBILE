import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, radius, spacing } from '../../../design-system';

const ICON_SIZE = 20;

export interface LoginEmailFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: boolean;
}

export function LoginEmailField({
  label = 'Email',
  error = false,
  autoComplete = 'email',
  textContentType = 'emailAddress',
  importantForAutofill = 'yes',
  inputMode = 'email',
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'email-address',
  spellCheck = false,
  returnKeyType = 'done',
  submitBehavior = 'submit',
  ...inputProps
}: LoginEmailFieldProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyMedium" style={styles.label}>
        {label}
      </AppText>

      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-outline" size={ICON_SIZE} color={colors.primary} />
        </View>
        <TextInput
          placeholder="Enter your email address"
          placeholderTextColor={colors.textSubtle}
          autoComplete={autoComplete}
          textContentType={textContentType}
          importantForAutofill={importantForAutofill}
          inputMode={inputMode}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          returnKeyType={returnKeyType}
          submitBehavior={submitBehavior}
          style={styles.input}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWrapError: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'android' ? 10 : spacing.sm,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : null),
  },
});
