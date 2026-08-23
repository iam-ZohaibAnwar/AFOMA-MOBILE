import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { OtpVerificationScreen } from '../../features/auth/screens/OtpVerificationScreen';
import { RegisterAccountScreen } from '../../features/auth/screens/RegisterAccountScreen';
import { RegisterChoiceScreen } from '../../features/auth/screens/RegisterChoiceScreen';
import { RegistrationSuccessScreen } from '../../features/auth/screens/RegistrationSuccessScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
      <Stack.Screen name="RegisterAccount" component={RegisterAccountScreen} />
      <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
}
