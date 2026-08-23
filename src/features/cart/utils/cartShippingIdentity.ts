import type { AuthUser } from '../../auth/types';
import type { CheckoutIdentity } from '../../checkout/types/checkoutIdentity';
import {
  authUserToCheckoutIdentity,
  buildGuestIdentityFromAddress,
  guestProfileToCheckoutIdentity,
} from '../../checkout/types/checkoutIdentity';
import type { ShippingAddress } from '../../checkout/types/shippingAddress';
import { validateShippingAddress } from '../../checkout/utils/validateShippingAddress';
import type { GuestCheckoutProfile } from '../../../services/storage/guestSessionStorage';
import { resolveAddressRegionCodes } from '../../checkout/utils/resolveAddressRegionCodes';

export function guestProfileToShippingAddress(profile: GuestCheckoutProfile): ShippingAddress {
  return {
    name: profile.name.trim(),
    email: profile.email.trim(),
    phone: profile.phone?.trim() ?? '',
    streetAddress: profile.streetAddress.trim(),
    city: profile.city.trim(),
    state: profile.state.trim(),
    zip: profile.ZipCode.trim(),
    country: profile.country.trim(),
  };
}

export function authUserToShippingAddress(user: AuthUser): ShippingAddress {
  const profile = user as AuthUser & Partial<ShippingAddress> & {
    ZipCode?: string;
    zipcode?: string;
    moNumber?: string;
  };

  const regionCodes = resolveAddressRegionCodes({
    country:
      user.countryName?.trim() || user.country?.trim() || user.Country?.trim() || profile.country?.trim() || '',
    state: profile.state,
    countryCode: profile.countryCode,
    stateCode: profile.stateCode,
  });

  return {
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || profile.name?.trim() || '',
    email: user.email?.trim() ?? '',
    phone: profile.phone?.trim() ?? profile.moNumber?.trim() ?? '',
    streetAddress: profile.streetAddress?.trim() ?? '',
    city: profile.city?.trim() ?? '',
    state: profile.state?.trim() ?? '',
    zip: profile.zip?.trim() || profile.ZipCode?.trim() || profile.zipcode?.trim() || '',
    country: user.countryName?.trim() || user.country?.trim() || user.Country?.trim() || profile.country?.trim() || '',
    countryCode: regionCodes.countryCode,
    stateCode: regionCodes.stateCode,
  };
}

export function resolveCartShippingContext(params: {
  user: AuthUser | null;
  authUserId?: string;
  guestProfile: GuestCheckoutProfile | null;
  shippingAddress: ShippingAddress;
}): {
  identity: CheckoutIdentity | null;
  canFetchRates: boolean;
  hasCheckoutIdentity: boolean;
  needsDeliveryDetails: boolean;
} {
  const { user, authUserId, guestProfile, shippingAddress } = params;
  const validation = validateShippingAddress(shippingAddress);

  let identity: CheckoutIdentity | null = null;

  if (authUserId && user) {
    identity = authUserToCheckoutIdentity(user);
  } else if (guestProfile) {
    identity = guestProfileToCheckoutIdentity(guestProfile);
  } else if (validation.isValid) {
    identity = buildGuestIdentityFromAddress(shippingAddress);
  }

  const hasCheckoutIdentity = Boolean(authUserId || guestProfile);
  const canFetchRates = validation.isValid && Boolean(identity?.email?.trim());
  const needsDeliveryDetails = !canFetchRates;

  return {
    identity,
    canFetchRates,
    hasCheckoutIdentity,
    needsDeliveryDetails,
  };
}
