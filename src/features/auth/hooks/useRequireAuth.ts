import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from './useAuth';
import { openAuthLogin, type AuthReturnTo, type NavLike } from '../utils/authNavigation';

export function useRequireAuth(returnTo: AuthReturnTo) {
  const navigation = useNavigation<NavLike>();
  const { isAuthenticated, isLoading } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (isLoading || isAuthenticated) {
        return;
      }

      openAuthLogin(navigation, returnTo);
    }, [isAuthenticated, isLoading, navigation, returnTo]),
  );

  return {
    isAuthenticated,
    isLoading,
    isAuthorized: !isLoading && isAuthenticated,
  };
}
