import { useCallback, useEffect, useState } from 'react';

import type { AuthUser } from '../../auth/types';
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

function buildInitialAddress(user: AuthUser | null): ShippingAddress {
  const base = emptyShippingAddress();

  if (!user) {
    return base;
  }

  return {
    ...base,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
    email: user.email?.trim() ?? '',
    country: user.countryName?.trim() || user.country?.trim() || user.Country?.trim() || '',
  };
}

export function useCheckoutShippingAddress(user: AuthUser | null) {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() =>
    buildInitialAddress(user),
  );
  const [addressErrors, setAddressErrors] = useState<ShippingAddressErrors>({});

  useEffect(() => {
    setShippingAddress((current) => {
      const seeded = buildInitialAddress(user);
      return {
        ...current,
        name: current.name || seeded.name,
        email: current.email || seeded.email,
        country: current.country || seeded.country,
      };
    });
  }, [user]);

  const updateField = useCallback((field: ShippingAddressField, value: string) => {
    setShippingAddress((current) => updateShippingAddressField(current, field, value));
    setAddressErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }, []);

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
  };
}
