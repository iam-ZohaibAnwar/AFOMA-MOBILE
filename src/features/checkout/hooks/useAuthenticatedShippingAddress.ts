import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getUserProfile } from '../../../services/api/usersApi';
import { updateStoredProfile } from '../../../services/auth/authSession';
import { loadSelectedDeliveryAddress } from '../../../services/storage/selectedDeliveryAddressStorage';
import type { AuthUser } from '../../auth/types';
import type { ShippingAddress } from '../types/shippingAddress';
import { emptyShippingAddress } from '../types/shippingAddress';
import { authUserToShippingAddress } from '../../cart/utils/cartShippingIdentity';
import {
  mapSavedUserAddressToShippingAddress,
  mapUserProfileToShippingAddress,
  mergeShippingAddress,
} from '../utils/mapUserProfileToShippingAddress';

export function useAuthenticatedShippingAddress(user: AuthUser | null, authUserId?: string) {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() =>
    user ? authUserToShippingAddress(user) : emptyShippingAddress(),
  );
  const [isLoading, setIsLoading] = useState(Boolean(authUserId));
  const [error, setError] = useState<string | null>(null);

  const loadAddress = useCallback(async () => {
    if (!authUserId || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedAddress = await loadSelectedDeliveryAddress();
      if (selectedAddress?.streetAddress?.trim()) {
        const mappedSelected = mapSavedUserAddressToShippingAddress(selectedAddress);
        setShippingAddress((current) =>
          mergeShippingAddress(current, {
            ...mappedSelected,
            email: mappedSelected.email || user.email?.trim() || current.email,
          }),
        );
        return;
      }

      const profile = await getUserProfile(authUserId);
      const mappedProfile = mapUserProfileToShippingAddress(profile, user.email?.trim() ?? '');

      setShippingAddress((current) => mergeShippingAddress(current, mappedProfile));

      await updateStoredProfile({
        userId: profile.userId ?? profile._id ?? authUserId,
        _id: profile._id ?? profile.userId ?? authUserId,
        email: profile.email ?? user.email,
        firstName: profile.firstName ?? user.firstName,
        lastName: profile.lastName ?? user.lastName,
        country: profile.country ?? profile.countryName ?? user.country,
        countryName: profile.countryName ?? profile.country ?? user.countryName,
        Country: profile.Country ?? user.Country,
        countryCode: profile.countryCode,
        stateCode: profile.stateCode,
        streetAddress: profile.streetAddress,
        state: profile.state,
        city: profile.city,
        ZipCode: profile.ZipCode ?? profile.zipcode,
        zipcode: profile.zipcode ?? profile.ZipCode,
        phone: profile.phone ?? profile.moNumber,
        moNumber: profile.moNumber ?? profile.phone,
        company: profile.company,
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load saved address'));
      setShippingAddress((current) => mergeShippingAddress(current, authUserToShippingAddress(user)));
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, user]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  return {
    shippingAddress,
    setShippingAddress,
    isLoading,
    error,
    reload: loadAddress,
  };
}
