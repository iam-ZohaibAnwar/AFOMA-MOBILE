import type { AuthUser } from '../../auth/types';
import type { ShippingUserInfo } from '../../../services/types/shipping';
import type { ShippingAddress } from '../types/shippingAddress';

export function buildShippingUserInfo(
  address: ShippingAddress,
  user: AuthUser,
): ShippingUserInfo {
  const nameParts = address.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  return {
    firstName,
    lastName,
    fname: firstName,
    lname: lastName,
    email: address.email.trim(),
    company: undefined,
    country: address.country.trim(),
    state: address.state.trim(),
    city: address.city.trim(),
    streetAddress: address.streetAddress.trim(),
    zipcode: address.zip.trim(),
    moNumber: address.phone.trim(),
    phone: address.phone.trim(),
    information: '',
    shippingMethod: 'Freightcom',
    accesstoken: user.accessToken,
  };
}

export function getShippingUserCountry(
  address: ShippingAddress,
  user: AuthUser | null,
): string | undefined {
  return address.country.trim() || user?.country?.trim() || user?.countryName?.trim();
}
