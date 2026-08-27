import { useCallback, useEffect, useState } from 'react';

import type { AuthUser } from '../../auth/types';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { guestProfileToShippingAddress } from '../../cart/utils/cartShippingIdentity';
import type {
  ShippingAddress,
  ShippingAddressErrors,
  ShippingAddressField,
} from '../types/shippingAddress';
import { emptyShippingAddress } from '../types/shippingAddress';
import {
  updateShippingAddressField,
  validateShippingAddress,
} from '../utils/validateShippingAddress';
import { useAuthenticatedShippingAddress } from './useAuthenticatedShippingAddress';
import { useGuestCheckoutIdentity } from './useGuestCheckoutIdentity';

export function useCheckoutShippingAddress(user: AuthUser | null) {
  const authUserId = resolveAuthUserId(user);
  const authShipping = useAuthenticatedShippingAddress(user, authUserId);
  const { guestProfile } = useGuestCheckoutIdentity(user);
  const [guestShippingAddress, setGuestShippingAddress] = useState<ShippingAddress>(emptyShippingAddress());
  const [addressErrors, setAddressErrors] = useState<ShippingAddressErrors>({});

  useEffect(() => {
    if (authUserId) {
      return;
    }

    if (guestProfile) {
      setGuestShippingAddress(guestProfileToShippingAddress(guestProfile));
    }
  }, [authUserId, guestProfile]);

  const shippingAddress = authUserId ? authShipping.shippingAddress : guestShippingAddress;
  const setShippingAddress = authUserId ? authShipping.setShippingAddress : setGuestShippingAddress;

  const updateField = useCallback(
    (field: ShippingAddressField, value: string) => {
      setShippingAddress((current) => updateShippingAddressField(current, field, value));
      setAddressErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        return nextErrors;
      });
    },
    [setShippingAddress],
  );

  const validateAddress = useCallback(() => {
    const result = validateShippingAddress(shippingAddress);
    setAddressErrors(result.errors);
    return result.isValid;
  }, [shippingAddress]);

  return {
    shippingAddress,
    addressErrors,
    updateField,
    validateAddress,
    isLoadingAuthAddress: authShipping.isLoading,
    authAddressError: authShipping.error,
    reloadAuthAddress: authShipping.reload,
  };
}
