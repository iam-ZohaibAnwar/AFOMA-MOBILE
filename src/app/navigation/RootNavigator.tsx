import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthContext } from '../../features/auth/context/AuthProvider';
import { GetPaidScreen } from '../../features/payout/screens/GetPaidScreen';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from '../../features/admin/navigation/AdminNavigator';
import { SellerNavigator } from './SellerNavigator';
import { ShoppingNavigator } from './ShoppingNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  useAuthContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Shopping">
      <Stack.Screen name="Shopping" component={ShoppingNavigator} />
      <Stack.Screen name="Seller" component={SellerNavigator} />
      <Stack.Screen name="Admin" component={AdminNavigator} />
      <Stack.Screen name="GetPaid" component={GetPaidScreen} />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
