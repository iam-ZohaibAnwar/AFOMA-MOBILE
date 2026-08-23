import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../../auth/hooks/useAuth';
import { resolveAuthSellerId } from '../../auth/utils/resolveAuthSellerId';
import { openAuthLogin } from '../../auth/utils/authNavigation';
import type { AuthReturnTo } from '../../auth/utils/authNavigation';

export function useRequireSeller(returnTo?: AuthReturnTo) {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const sellerId = resolveAuthSellerId(user);

  const isSeller = role === 'seller' && Boolean(sellerId);
  const isAuthorized = isAuthenticated && isSeller;

  useFocusEffect(
    useCallback(() => {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        openAuthLogin(navigation, returnTo);
      }
    }, [isAuthenticated, isLoading, navigation, returnTo]),
  );

  return {
    isAuthorized,
    isSeller,
    sellerId,
    isLoading,
    role,
  };
}
