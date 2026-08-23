import type { SavedUserAddress, UserProfileResponse } from '../../../services/api/usersApi';
import type { DeliveryAddressListItem, SavedAddressFormValues } from '../types/deliveryAddress';
import { resolveAddressRegionCodes } from './resolveAddressRegionCodes';

export function buildDeliveryAddressList(profile: UserProfileResponse): DeliveryAddressListItem[] {
  const profileId = profile._id ?? profile.userId;
  const defaultEntry: DeliveryAddressListItem = {
    _id: profileId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    streetAddress: profile.streetAddress,
    city: profile.city,
    state: profile.state,
    stateCode: profile.stateCode,
    country: profile.country ?? profile.countryName ?? profile.Country,
    countryCode: profile.countryCode,
    ZipCode: profile.ZipCode ?? profile.zipcode,
    zipcode: profile.zipcode ?? profile.ZipCode,
    phone: profile.phone ?? profile.moNumber,
    moNumber: profile.moNumber ?? profile.phone,
    isDefault: true,
    id: 1,
  };

  const additional = (profile.address ?? []).map((address, index) => ({
    ...address,
    id: index + 2,
    isDefault: false,
  }));

  return [defaultEntry, ...additional];
}

export function resolveInitialSelectedAddressId(
  addresses: DeliveryAddressListItem[],
  selectedAddress: SavedUserAddress | null,
): string | undefined {
  if (selectedAddress?._id) {
    const match = addresses.find((item) => item._id === selectedAddress._id);
    if (match?._id) {
      return match._id;
    }
  }

  return addresses[0]?._id;
}

export function formValuesToSavedAddress(
  values: SavedAddressFormValues,
  existing?: DeliveryAddressListItem | null,
): SavedUserAddress {
  const regionCodes = resolveAddressRegionCodes({
    country: values.country,
    state: values.state,
    countryCode: values.countryCode,
    stateCode: values.stateCode,
  });

  return {
    _id: existing?._id,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    streetAddress: values.streetAddress.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    stateCode: regionCodes.stateCode,
    country: values.country.trim(),
    countryCode: regionCodes.countryCode,
    ZipCode: values.zip.trim(),
    zipcode: values.zip.trim(),
  };
}

export function stripClientAddressFields(
  addresses: DeliveryAddressListItem[],
): SavedUserAddress[] {
  return addresses
    .filter((item) => !item.isDefault)
    .map(({ id, isDefault, ...rest }) => rest);
}
