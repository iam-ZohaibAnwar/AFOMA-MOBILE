import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { OTP_LENGTH } from '../../../constants/auth';
import { colors, radius, spacing } from '../../../design-system';
import { sanitizeOtpInput } from '../utils/otp';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, onComplete, error = false, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const sanitized = sanitizeOtpInput(text);

    if (sanitized.length > 1) {
      onChange(sanitized);
      if (sanitized.length === OTP_LENGTH) {
        onComplete(sanitized);
      }
      focusInput(Math.min(sanitized.length, OTP_LENGTH - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    const nextValue = nextDigits.join('').slice(0, OTP_LENGTH);
    onChange(nextValue);

    if (sanitized && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }

    if (nextValue.length === OTP_LENGTH) {
      onComplete(nextValue);
    }
  };

  const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (event.nativeEvent.key !== 'Backspace') {
      return;
    }

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      onChange(nextDigits.join(''));
      return;
    }

    if (index > 0) {
      focusInput(index - 1);
      const nextDigits = [...digits];
      nextDigits[index - 1] = '';
      onChange(nextDigits.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.input,
              isFocused && !error ? styles.inputFocused : null,
              error ? styles.inputError : null,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() =>
              setFocusedIndex((current) => (current === index ? null : current))
            }
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            editable={!disabled}
            selectTextOnFocus
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
          />
        );
      })}
    </View>
  );
}

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary,
        isDisabled ? styles.buttonDisabled : null,
        pressed && !isDisabled ? styles.buttonPressed : null,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'secondary' ? styles.buttonTextSecondary : null]}>
        {loading ? 'Please wait...' : label}
      </Text>
    </Pressable>
  );
}

export function AuthErrorText({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  input: {
    width: 46,
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.large,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#EA580C',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#EA580C',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
