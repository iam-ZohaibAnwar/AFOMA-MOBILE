import type { ShippingUserInfo } from '../../../services/types/shipping';
import type { CheckoutIdentity } from '../types/checkoutIdentity';
import type { ShippingAddress } from '../types/shippingAddress';
import type { ResolvedAddressRegionCodes } from './resolveAddressRegionCodes';

export function buildShippingUserInfo(
  address: ShippingAddress,
  identity?: CheckoutIdentity | null,
  regionCodes?: ResolvedAddressRegionCodes,
): ShippingUserInfo {
  const nameParts = address.name.trim().split(/\s+/).filter(Boolean);
  const firstName = identity?.firstName?.trim() || nameParts[0] || '';
  const lastName = identity?.lastName?.trim() || nameParts.slice(1).join(' ') || firstName;
  const zip = address.zip.trim() || identity?.ZipCode?.trim() || '';
  const countryCode = regionCodes?.countryCode || identity?.countryCode?.trim() || '';
  const stateCode = regionCodes?.stateCode || identity?.stateCode?.trim() || '';

  return {
    firstName,
    lastName,
    fname: firstName,
    lname: lastName,
    email: address.email.trim() || identity?.email?.trim() || '',
    company: identity?.company,
    country: address.country.trim() || identity?.country?.trim() || '',
    state: address.state.trim() || identity?.state?.trim() || '',
    countryCode,
    stateCode,
    city: address.city.trim() || identity?.city?.trim() || '',
    streetAddress: address.streetAddress.trim() || identity?.streetAddress?.trim() || '',
    zipcode: zip,
    ZipCode: zip,
    moNumber: address.phone.trim() || identity?.phone?.trim() || '',
    information: '',
    shippingMethod: 'Freightcom',
    accesstoken: identity?.accessToken,
  };
}

/** Geo buyer country for rate quotes — mirrors web `userInfoStored.country`. */
export function getShippingBuyerCountry(pricingCountry?: string): string | undefined {
  const country = pricingCountry?.trim();
  return country || undefined;
}
