import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { completeAuthNavigation } from '../utils/authNavigation';
import type { AuthStackParamList, RootStackParamList } from '../../../app/navigation/types';
import { colors, spacing } from '../../../design-system';
import { getErrorMessage } from '../../../services/api/errors';
import { AuthErrorText, OtpInput } from '../components/AuthForm';
import { OtpVerificationHeroIcon } from '../components/OtpVerificationHeroIcon';
import { useAuth } from '../hooks/useAuth';
import { useOtpResendCooldown } from '../hooks/useOtpResendCooldown';
import { isCompleteOtp } from '../utils/otp';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({ navigation, route }: Props) {
  const { email, otpToken: initialOtpToken, returnTo } = route.params;
  const { requestOtp, verifyOtp } = useAuth();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

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
        completeAuthNavigation(rootNavigation, returnTo);
      } catch (err) {
        setOtpError(true);
        setError(getErrorMessage(err, 'Invalid OTP'));
      } finally {
        setLoading(false);
      }
    },
    [loading, otpToken, returnTo, rootNavigation, verifyOtp],
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
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <HeaderBackButton onPress={() => navigation.goBack()} />
        <AppText variant="h3" style={styles.headerTitle}>
          Verification
        </AppText>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIconWrap}>
          <OtpVerificationHeroIcon />
        </View>

        <AppText variant="h2" style={styles.title}>
          Verification Code
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          We have sent the code verification to{' '}
          <AppText variant="bodyMedium" style={styles.email}>
            {email}
          </AppText>
        </AppText>

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

        <AppButton
          label="Submit"
          fullWidth
          size="lg"
          shape="pill"
          loading={loading}
          disabled={!isCompleteOtp(otp)}
          onPress={() => void handleVerify(otp)}
          style={styles.submitButton}
        />

        <View style={styles.resendWrap}>
          <AppText variant="body" color="textSecondary">
            Didn&apos;t receive the code?{' '}
          </AppText>
          {canResend ? (
            <Pressable accessibilityRole="button" onPress={() => void handleResend()} disabled={resending}>
              <AppText variant="bodyMedium" color="textLink" style={styles.resendLink}>
                {resending ? 'Sending...' : 'Resend'}
              </AppText>
            </Pressable>
          ) : (
            <AppText variant="body" color="textMuted">
              Resend in {secondsRemaining}s
            </AppText>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  heroIconWrap: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  email: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  resendWrap: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLink: {
    fontWeight: '600',
  },
});
