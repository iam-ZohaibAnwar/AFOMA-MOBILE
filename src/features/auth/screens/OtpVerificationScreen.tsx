import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthButton, AuthErrorText, OtpInput } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useOtpResendCooldown } from '../hooks/useOtpResendCooldown';
import { isCompleteOtp } from '../utils/otp';
import type { AuthStackParamList, RootStackParamList } from '../../../app/navigation/types';
import { getErrorMessage } from '../../../services/api/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({ navigation, route }: Props) {
  const { email, otpToken: initialOtpToken } = route.params;
  const { requestOtp, verifyOtp } = useAuth();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [otpToken, setOtpToken] = useState(initialOtpToken);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState(false);

  const { secondsRemaining, canResend, restartCooldown } = useOtpResendCooldown(true);

  const handleVerify = useCallback(
    async (code: string) => {
      if (!isCompleteOtp(code) || loading) {
        if (!isCompleteOtp(code)) {
          setOtpError(true);
          setError('Enter the 6-digit code');
        }
        return;
      }

      setLoading(true);
      setError(null);
      setOtpError(false);

      try {
        await verifyOtp({ otp: code, otpToken });
        rootNavigation.navigate('Shopping', { screen: 'Home' });
      } catch (err) {
        setOtpError(true);
        setError(getErrorMessage(err, 'Invalid OTP'));
      } finally {
        setLoading(false);
      }
    },
    [loading, otpToken, rootNavigation, verifyOtp],
  );

  const handleResend = async () => {
    if (!canResend || resending) {
      return;
    }

    setResending(true);
    setError(null);
    setOtpError(false);
    setOtp('');

    try {
      const response = await requestOtp(email);
      setOtpToken(response.otpToken);
      restartCooldown();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend OTP'));
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (otpError) {
                setOtpError(false);
                setError(null);
              }
            }}
            onComplete={(value) => void handleVerify(value)}
            error={otpError}
            disabled={loading}
          />

          <AuthErrorText message={error} />

          <View style={styles.resendWrap}>
            {canResend ? (
              <Pressable onPress={() => void handleResend()} disabled={resending}>
                <Text style={styles.resendLink}>{resending ? 'Sending...' : 'Resend OTP'}</Text>
              </Pressable>
            ) : (
              <Text style={styles.resendTimer}>Resend OTP in {secondsRemaining}s</Text>
            )}
          </View>

          <View style={styles.buttonWrap}>
            <AuthButton
              label="Verify"
              onPress={() => void handleVerify(otp)}
              loading={loading}
              disabled={!isCompleteOtp(otp)}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFEDD5',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 24,
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: '#172554',
  },
  resendWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendLink: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendTimer: {
    color: '#64748B',
    fontSize: 14,
  },
  buttonWrap: {
    marginTop: 20,
  },
});
