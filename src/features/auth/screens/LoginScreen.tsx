import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthButton, AuthErrorText } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail } from '../utils/validation';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { getErrorMessage } from '../../../services/api/errors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { requestOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { otpToken } = await requestOtp(trimmedEmail);
      navigation.navigate('OtpVerification', {
        email: trimmedEmail,
        otpToken,
      });
    } catch (err) {
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Enter your email to receive a one-time sign-in code.
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <AuthErrorText message={error} />

          <View style={styles.buttonWrap}>
            <AuthButton label="Continue" onPress={() => void handleSubmit()} loading={loading} />
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#172554',
  },
  buttonWrap: {
    marginTop: 20,
  },
});
