import type { SavedUserAddress } from '../../../services/api/usersApi';

export interface DeliveryAddressListItem extends SavedUserAddress {
  id: number;
  isDefault?: boolean;
}

export interface SavedAddressFormValues {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  countryCode?: string;
  stateCode?: string;
}

export type SavedAddressFormField = keyof SavedAddressFormValues;

export function emptySavedAddressFormValues(): SavedAddressFormValues {
  return {
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    countryCode: '',
    stateCode: '',
  };
}

export function deliveryAddressToFormValues(
  address: DeliveryAddressListItem | null | undefined,
): SavedAddressFormValues {
  if (!address) {
    return emptySavedAddressFormValues();
  }

  return {
    firstName: address.firstName?.trim() ?? '',
    lastName: address.lastName?.trim() ?? '',
    streetAddress: address.streetAddress?.trim() ?? '',
    city: address.city?.trim() ?? '',
    state: address.state?.trim() ?? '',
    zip: address.ZipCode?.trim() ?? address.zipcode?.trim() ?? '',
    country: address.country?.trim() ?? '',
    countryCode: address.countryCode?.trim() ?? '',
    stateCode: address.stateCode?.trim() ?? '',
  };
}
