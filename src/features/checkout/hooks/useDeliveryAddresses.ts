import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import {
  getUserProfile,
  updateUserAddresses,
  type SavedUserAddress,
} from '../../../services/api/usersApi';
import {
  clearSelectedDeliveryAddress,
  loadSelectedDeliveryAddress,
  saveSelectedDeliveryAddress,
} from '../../../services/storage/selectedDeliveryAddressStorage';
import type { DeliveryAddressListItem, SavedAddressFormValues } from '../types/deliveryAddress';
import {
  buildDeliveryAddressList,
  formValuesToSavedAddress,
  resolveInitialSelectedAddressId,
  stripClientAddressFields,
} from '../utils/deliveryAddressUtils';

interface UseDeliveryAddressesParams {
  userId?: string;
  enabled?: boolean;
}

export function useDeliveryAddresses({ userId, enabled = true }: UseDeliveryAddressesParams) {
  const [addresses, setAddresses] = useState<DeliveryAddressListItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!userId) {
      setAddresses([]);
      setSelectedAddressId(undefined);
      setError('Account ID unavailable. Sign in again and retry.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [profile, selectedAddress] = await Promise.all([
        getUserProfile(userId),
        loadSelectedDeliveryAddress(),
      ]);
      const nextAddresses = buildDeliveryAddressList(profile);
      setAddresses(nextAddresses);
      setSelectedAddressId(resolveInitialSelectedAddressId(nextAddresses, selectedAddress));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load delivery addresses'));
      setAddresses([]);
      setSelectedAddressId(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const selectAddress = useCallback(
    async (address: DeliveryAddressListItem) => {
      if (!address._id) {
        return null;
      }

      await saveSelectedDeliveryAddress(address);
      setSelectedAddressId(address._id);
      return address;
    },
    [],
  );

  const saveAddress = useCallback(
    async (values: SavedAddressFormValues, editingAddress?: DeliveryAddressListItem | null) => {
      if (!userId) {
        throw new Error('Sign in to save delivery addresses.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const currentUser = await getUserProfile(userId);
        const currentAddresses = buildDeliveryAddressList(currentUser);
        const payloadAddress = formValuesToSavedAddress(values, editingAddress);
        let nextSecondaryAddresses = stripClientAddressFields(currentAddresses);

        if (editingAddress?.id && !editingAddress.isDefault) {
          nextSecondaryAddresses = nextSecondaryAddresses.map((item) =>
            item._id === editingAddress._id ? payloadAddress : item,
          );
        } else {
          nextSecondaryAddresses = [...(currentUser.address ?? []), payloadAddress];
        }

        const response = await updateUserAddresses(userId, nextSecondaryAddresses);
        const nextAddresses = buildDeliveryAddressList(response);
        setAddresses(nextAddresses);
        setSelectedAddressId((current) =>
          resolveInitialSelectedAddressId(nextAddresses, current ? { _id: current } : null),
        );
        return nextAddresses;
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to save address');
        setError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [userId],
  );

  const deleteAddress = useCallback(
    async (address: DeliveryAddressListItem) => {
      if (!userId || address.isDefault || !address.id) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const selectedAddress = await loadSelectedDeliveryAddress();
        const nextSecondaryAddresses = stripClientAddressFields(addresses).filter(
          (item) => item._id !== address._id,
        );
        const response = await updateUserAddresses(userId, nextSecondaryAddresses);
        const nextAddresses = buildDeliveryAddressList(response);
        setAddresses(nextAddresses);

        if (selectedAddress?._id && selectedAddress._id === address._id) {
          await clearSelectedDeliveryAddress();
          setSelectedAddressId(nextAddresses[0]?._id);
        } else {
          setSelectedAddressId((current) =>
            resolveInitialSelectedAddressId(nextAddresses, selectedAddress),
          );
        }
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to delete address');
        setError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [addresses, userId],
  );

  return {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    isLoading,
    isSaving,
    error,
    reload: loadAddresses,
    selectAddress,
    saveAddress,
    deleteAddress,
  };
}
