import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import type { AuthStackParamList } from '../../../app/navigation/types';
import { spacing } from '../../../design-system';
import { AuthFlowScreen } from '../components/AuthFlowScreen';
import { dismissAuthFlow } from '../utils/authNavigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegisterChoice'>;

export function RegisterChoiceScreen({ navigation }: Props) {
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    dismissAuthFlow(navigation);
  };

  return (
    <AuthFlowScreen
      title="Create account"
      subtitle="What type of account do you want to create?"
      onBack={handleBack}
      footer={
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Login')}>
          <AppText variant="bodySmall" color="textSecondary" style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <AppText variant="bodySmall" color="textLink" style={{ fontWeight: '600' }}>
              Sign in
            </AppText>
          </AppText>
        </Pressable>
      }
    >
      <AppButton
        label="Register as buyer"
        fullWidth
        size="lg"
        shape="pill"
        onPress={() => navigation.navigate('RegisterAccount', { accountType: 'buyer' })}
        style={{ marginTop: spacing.md }}
      />
      <AppButton
        label="Register as seller"
        fullWidth
        size="lg"
        shape="pill"
        variant="outline"
        onPress={() => navigation.navigate('RegisterAccount', { accountType: 'seller' })}
      />
    </AuthFlowScreen>
  );
}
