import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { colors, spacing } from '../../../design-system';
import { getErrorMessage } from '../../../services/api/errors';
import { getLastLoginEmail, setLastLoginEmail } from '../../../services/storage/loginEmailStorage';
import { AuthErrorText } from '../components/AuthForm';
import { LoginEmailField } from '../components/LoginEmailField';
import { LoginHeroArt } from '../components/LoginHeroArt';
import { useAuth } from '../hooks/useAuth';
import { continueShoppingAsGuest, dismissAuthFlow } from '../utils/authNavigation';
import { isValidEmail } from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const returnTo = route.params?.returnTo;
  const { requestOtp } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const lastEmail = await getLastLoginEmail();
      if (!cancelled && lastEmail) {
        setEmail(lastEmail);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    dismissAuthFlow(navigation);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setEmailError(true);
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailError(false);

    try {
      const { otpToken } = await requestOtp(trimmedEmail);
      await setLastLoginEmail(trimmedEmail);
      navigation.navigate('OtpVerification', {
        email: trimmedEmail,
        otpToken,
        returnTo,
      });
    } catch (err) {
      setEmailError(true);
      setError(getErrorMessage(err, 'Sign-in request failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <HeaderBackButton onPress={handleBack} accessibilityLabel="Go back" />
        </View>
        <AppText variant="h1" style={styles.title}>
          Login Account
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.subtitle}>
          Please sign in with your registered email. We&apos;ll send a one-time verification code.
        </AppText>

        <View style={styles.form}>
          <LoginEmailField
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) {
                setEmailError(false);
                setError(null);
              }
            }}
            error={emailError}
            editable={!loading}
            autoFocus
            onSubmitEditing={() => void handleSubmit()}
          />

          <AuthErrorText message={error} />

          <AppButton
            label="Sign In"
            fullWidth
            size="lg"
            shape="pill"
            loading={loading}
            onPress={() => void handleSubmit()}
            style={styles.signInButton}
          />

          <AppButton
            label="Continue without signing in"
            fullWidth
            size="md"
            variant="ghost"
            onPress={() => continueShoppingAsGuest(navigation)}
            style={styles.guestButton}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('RegisterChoice')}
            style={styles.registerWrap}
          >
            <AppText variant="bodySmall" color="textSecondary" style={styles.registerText}>
              Don&apos;t have an account?{' '}
              <AppText variant="bodySmall" color="textLink" style={styles.registerLink}>
                Register here
              </AppText>
            </AppText>
          </Pressable>
        </View>

        <LoginHeroArt />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: spacing['3xl'],
  },
  form: {
    gap: spacing.lg,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  guestButton: {
    marginTop: -spacing.sm,
  },
  registerWrap: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  registerText: {
    textAlign: 'center',
  },
  registerLink: {
    fontWeight: '600',
  },
});
