import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../auth/hooks/useAuth';
import type { AuthReturnTo } from '../../auth/utils/authNavigation';
import type { AdminStackParamList } from '../navigation/adminTypes';
import { useRequireAdmin } from './useRequireAdmin';

/**
 * Gate for modules requiring the acting admin's JWT fullAccess claim
 * (User Management, Commission). Not a managed commission recipient's role or payout state.
 */
export function useRequireFullAccess(returnTo?: AuthReturnTo) {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const adminGate = useRequireAdmin(returnTo);
  const { fullAccess, isLoading: isAuthLoading } = useAuth();

  const isAuthorized = adminGate.isAuthorized && fullAccess;

  useFocusEffect(
    useCallback(() => {
      if (adminGate.isLoading || isAuthLoading) {
        return;
      }

      if (!adminGate.isAuthorized) {
        return;
      }

      if (!fullAccess) {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }

        navigation.navigate('AdminDashboard');
      }
    }, [adminGate.isAuthorized, adminGate.isLoading, fullAccess, isAuthLoading, navigation]),
  );

  return {
    isAuthorized,
    isAdmin: adminGate.isAdmin,
    isLoading: adminGate.isLoading || isAuthLoading,
    role: adminGate.role,
    fullAccess,
  };
}
