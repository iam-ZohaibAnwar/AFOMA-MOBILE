import { useMemo } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { spacing } from '../../../design-system';
import { AuthFlowScreen } from '../components/AuthFlowScreen';
import { continueShoppingAsGuest } from '../utils/authNavigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegistrationSuccess'>;

export function RegistrationSuccessScreen({ navigation, route }: Props) {
  const { accountType } = route.params;

  const copy = useMemo(
    () =>
      accountType === 'seller'
        ? {
            title: 'Thank you!',
            subtitle:
              'Thank you for registering to join our artisan community. Your seller account is approved — check your email for next steps to complete your profile and start uploading products.',
            primaryLabel: 'Go to home',
          }
        : {
            title: 'Thank you!',
            subtitle:
              'Your buyer account has been created. Sign in with your email to start shopping and tracking orders.',
            primaryLabel: 'Go to home',
          },
    [accountType],
  );

  const handleGoHome = () => {
    continueShoppingAsGuest(navigation);
  };

  const handleSignIn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <AuthFlowScreen
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={handleGoHome}
      backAccessibilityLabel="Go to home"
    >
      <AppButton
        label={copy.primaryLabel}
        fullWidth
        size="lg"
        shape="pill"
        onPress={handleGoHome}
        style={{ marginTop: spacing.lg }}
      />
      <AppButton
        label="Sign in now"
        fullWidth
        size="md"
        variant="outline"
        onPress={handleSignIn}
      />
    </AuthFlowScreen>
  );
}
