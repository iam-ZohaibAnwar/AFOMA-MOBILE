import { useCallback, useEffect, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import {
  createGuestUser,
  sendGuestCheckoutOtp,
  verifyGuestCheckoutOtp,
} from '../../../services/api/guestCheckoutApi';
import {
  loadGuestCheckoutProfile,
  saveGuestCheckoutProfile,
  type GuestCheckoutProfile,
} from '../../../services/storage/guestSessionStorage';
import type { AuthUser } from '../../auth/types';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import type { ShippingAddress } from '../types/shippingAddress';
import {
  authUserToCheckoutIdentity,
  buildGuestIdentityFromAddress,
  checkoutIdentityToAuthUser,
  guestProfileToCheckoutIdentity,
  shippingAddressToGuestProfile,
  type CheckoutIdentity,
} from '../types/checkoutIdentity';
import { validateShippingAddress } from '../utils/validateShippingAddress';

export function useGuestCheckoutIdentity(authUser: AuthUser | null) {
  const [guestProfile, setGuestProfile] = useState<GuestCheckoutProfile | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [isEstablishingGuest, setIsEstablishingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  useEffect(() => {
    void loadGuestCheckoutProfile().then(setGuestProfile);
  }, []);

  const checkoutIdentity = useMemo<CheckoutIdentity | null>(() => {
    if (authUser && resolveAuthUserId(authUser)) {
      return authUserToCheckoutIdentity(authUser);
    }

    if (guestProfile) {
      return guestProfileToCheckoutIdentity(guestProfile);
    }

    return null;
  }, [authUser, guestProfile]);

  const resolveIdentityForAddress = useCallback(
    (address: ShippingAddress): CheckoutIdentity | null => {
      if (authUser && resolveAuthUserId(authUser)) {
        return authUserToCheckoutIdentity(authUser);
      }

      if (guestProfile) {
        return guestProfileToCheckoutIdentity(guestProfile);
      }

      const validation = validateShippingAddress(address);
      if (!validation.isValid) {
        return null;
      }

      return buildGuestIdentityFromAddress(address);
    },
    [authUser, guestProfile],
  );

  const persistGuestProfile = useCallback(async (profile: GuestCheckoutProfile) => {
    await saveGuestCheckoutProfile(profile);
    setGuestProfile(profile);
  }, []);

  const establishGuestCheckout = useCallback(
    async (address: ShippingAddress): Promise<CheckoutIdentity> => {
      if (authUser && resolveAuthUserId(authUser)) {
        return authUserToCheckoutIdentity(authUser);
      }

      setIsEstablishingGuest(true);
      setGuestError(null);

      try {
        const profile = shippingAddressToGuestProfile(address);
        await persistGuestProfile(profile);

        await createGuestUser({
          name: profile.name,
          email: profile.email,
          data: profile as unknown as Record<string, unknown>,
        });

        return guestProfileToCheckoutIdentity(profile);
      } catch (err) {
        const message = getErrorMessage(err, 'Failed to prepare guest checkout');
        setGuestError(message);
        throw err;
      } finally {
        setIsEstablishingGuest(false);
      }
    },
    [authUser, persistGuestProfile],
  );

  const requestGuestOtp = useCallback(async (address: ShippingAddress) => {
    const profile = shippingAddressToGuestProfile(address);
    await persistGuestProfile(profile);

    const response = await sendGuestCheckoutOtp(profile);
    if (!response.success || !response.otpToken) {
      throw new Error(response.message || 'Failed to send verification code');
    }

    setOtpToken(response.otpToken);
    return response.otpToken;
  }, [persistGuestProfile]);

  const verifyGuestOtp = useCallback(
    async (otp: string, token: string) => {
      const response = await verifyGuestCheckoutOtp(otp, token);
      if (!response.success || !response.user) {
        throw new Error(response.message || 'Invalid verification code');
      }

      const verifiedProfile: GuestCheckoutProfile = {
        ...shippingAddressToGuestProfile({
          name: response.user.firstName
            ? [response.user.firstName, response.user.lastName].filter(Boolean).join(' ')
            : guestProfile?.name ?? '',
          email: response.user.email ?? guestProfile?.email ?? '',
          phone: guestProfile?.phone ?? '',
          streetAddress: guestProfile?.streetAddress ?? '',
          city: guestProfile?.city ?? '',
          state: guestProfile?.state ?? '',
          zip: guestProfile?.ZipCode ?? '',
          country: guestProfile?.country ?? '',
        }),
        userId: response.user.userId ?? response.user._id,
        _id: response.user._id ?? response.user.userId,
        accessToken: response.user.accessToken,
      };

      await persistGuestProfile(verifiedProfile);
      await createGuestUser({
        name: verifiedProfile.name,
        email: verifiedProfile.email,
        data: verifiedProfile as unknown as Record<string, unknown>,
      });

      setOtpToken(null);
      return guestProfileToCheckoutIdentity(verifiedProfile);
    },
    [guestProfile, persistGuestProfile],
  );

  const toAuthUser = useCallback((identity: CheckoutIdentity): AuthUser => {
    return checkoutIdentityToAuthUser(identity);
  }, []);

  return {
    checkoutIdentity,
    guestProfile,
    otpToken,
    isEstablishingGuest,
    guestError,
    resolveIdentityForAddress,
    establishGuestCheckout,
    requestGuestOtp,
    verifyGuestOtp,
    toAuthUser,
    clearGuestError: () => setGuestError(null),
  };
}
