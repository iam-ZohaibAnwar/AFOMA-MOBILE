import type { AuthUser } from '../../auth/types';
import type { GuestCheckoutProfile } from '../../../services/storage/guestSessionStorage';
import type { ShippingAddress } from '../types/shippingAddress';
import { resolveAddressRegionCodes } from '../utils/resolveAddressRegionCodes';

export interface CheckoutIdentity {
  userId?: string;
  _id?: string;
  accessToken?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  country?: string;
  countryCode?: string;
  stateCode?: string;
  streetAddress?: string;
  state?: string;
  city?: string;
  ZipCode?: string;
  phone?: string;
  company?: string;
  isGuest?: boolean;
}

export function buildGuestIdentityFromAddress(address: ShippingAddress): CheckoutIdentity {
  const nameParts = address.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const regionCodes = resolveAddressRegionCodes({
    country: address.country,
    state: address.state,
    countryCode: address.countryCode,
    stateCode: address.stateCode,
  });

  return {
    email: address.email.trim(),
    firstName,
    lastName,
    name: address.name.trim(),
    country: address.country.trim(),
    countryCode: regionCodes.countryCode,
    stateCode: regionCodes.stateCode,
    streetAddress: address.streetAddress.trim(),
    state: address.state.trim(),
    city: address.city.trim(),
    ZipCode: address.zip.trim(),
    phone: address.phone.trim(),
    isGuest: true,
  };
}

export function authUserToCheckoutIdentity(user: AuthUser): CheckoutIdentity {
  const profile = user as AuthUser & {
    countryCode?: string;
    stateCode?: string;
    streetAddress?: string;
    state?: string;
    city?: string;
    ZipCode?: string;
    zipcode?: string;
    phone?: string;
    company?: string;
  };

  return {
    userId: user.userId ?? user._id,
    _id: user._id ?? user.userId,
    accessToken: user.accessToken,
    email: user.email?.trim() ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || undefined,
    country: user.countryName?.trim() || user.country?.trim() || user.Country?.trim(),
    countryCode: profile.countryCode?.trim(),
    stateCode: profile.stateCode?.trim(),
    streetAddress: profile.streetAddress?.trim(),
    state: profile.state?.trim(),
    city: profile.city?.trim(),
    ZipCode: profile.ZipCode?.trim() || profile.zipcode?.trim(),
    phone: profile.phone?.trim(),
    company: profile.company?.trim(),
    isGuest: false,
  };
}

export function guestProfileToCheckoutIdentity(profile: GuestCheckoutProfile): CheckoutIdentity {
  const nameParts = profile.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const regionCodes = resolveAddressRegionCodes({
    country: profile.country,
    state: profile.state,
    countryCode: profile.countryCode,
    stateCode: profile.stateCode,
  });

  return {
    userId: profile.userId ?? profile._id,
    _id: profile._id ?? profile.userId,
    accessToken: profile.accessToken,
    email: profile.email.trim(),
    firstName,
    lastName,
    name: profile.name.trim(),
    country: profile.country.trim(),
    countryCode: regionCodes.countryCode,
    stateCode: regionCodes.stateCode,
    streetAddress: profile.streetAddress.trim(),
    state: profile.state.trim(),
    city: profile.city.trim(),
    ZipCode: profile.ZipCode.trim(),
    phone: profile.phone?.trim(),
    isGuest: !profile.accessToken,
  };
}

export function shippingAddressToGuestProfile(address: ShippingAddress): GuestCheckoutProfile {
  const regionCodes = resolveAddressRegionCodes({
    country: address.country,
    state: address.state,
    countryCode: address.countryCode,
    stateCode: address.stateCode,
  });

  return {
    name: address.name.trim(),
    email: address.email.trim(),
    country: address.country.trim(),
    countryCode: regionCodes.countryCode,
    streetAddress: address.streetAddress.trim(),
    state: address.state.trim(),
    stateCode: regionCodes.stateCode,
    ZipCode: address.zip.trim(),
    city: address.city.trim(),
    phone: address.phone.trim(),
  };
}

export function checkoutIdentityToAuthUser(identity: CheckoutIdentity): AuthUser {
  return {
    userId: identity.userId ?? identity._id,
    _id: identity._id ?? identity.userId,
    email: identity.email,
    firstName: identity.firstName,
    lastName: identity.lastName,
    country: identity.country,
    accessToken: identity.accessToken ?? '',
  };
}
