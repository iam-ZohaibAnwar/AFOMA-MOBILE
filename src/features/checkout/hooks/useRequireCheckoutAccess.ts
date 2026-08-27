import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { loadGuestCheckoutProfile } from '../../../services/storage/guestSessionStorage';
import { useAuth } from '../../auth/hooks/useAuth';
import { openAuthLogin, type AuthReturnTo, type NavLike } from '../../auth/utils/authNavigation';

export function useRequireCheckoutAccess(returnTo: AuthReturnTo) {
  const navigation = useNavigation<NavLike>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [guestReady, setGuestReady] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        setGuestReady(false);
        setGuestLoading(false);
        return;
      }

      let active = true;
      setGuestLoading(true);

      void loadGuestCheckoutProfile().then((profile) => {
        if (!active) {
          return;
        }

        setGuestReady(Boolean(profile?.email?.trim()));
        setGuestLoading(false);
      });

      return () => {
        active = false;
      };
    }, [isAuthenticated]),
  );

  const hasAccess = isAuthenticated || guestReady;
  const isLoading = authLoading || guestLoading;

  useFocusEffect(
    useCallback(() => {
      if (isLoading || hasAccess) {
        return;
      }

      openAuthLogin(navigation, returnTo);
    }, [hasAccess, isLoading, navigation, returnTo]),
  );

  return {
    isAuthenticated,
    isGuestCheckout: !isAuthenticated && guestReady,
    isLoading,
    isAuthorized: !isLoading && hasAccess,
  };
}
