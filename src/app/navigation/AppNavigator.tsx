import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ShoppingNavigator } from './ShoppingNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Authenticated app shell.
 * Shopping is available here for signed-in users; seller/affiliate/admin areas will be added later.
 */
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shopping" component={ShoppingNavigator} />
    </Stack.Navigator>
  );
}
