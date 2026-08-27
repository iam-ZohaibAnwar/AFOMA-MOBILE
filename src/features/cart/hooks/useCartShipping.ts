import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { saveGuestCart } from '../../../services/storage/cartStorage';
import type { CartMap } from '../../../services/types/cart';
import type { AuthUser } from '../../auth/types';
import { useGuestCheckoutIdentity } from '../../checkout/hooks/useGuestCheckoutIdentity';
import { useAuthenticatedShippingAddress } from '../../checkout/hooks/useAuthenticatedShippingAddress';
import { useCheckoutShippingRates } from '../../checkout/hooks/useCheckoutShippingRates';
import {
  emptyShippingAddress,
  type ShippingAddress,
} from '../../checkout/types/shippingAddress';
import {
  mapSavedUserAddressToShippingAddress,
  mergeShippingAddress,
} from '../../checkout/utils/mapUserProfileToShippingAddress';
import { validateShippingAddress } from '../../checkout/utils/validateShippingAddress';
import { saveSelectedDeliveryAddress } from '../../../services/storage/selectedDeliveryAddressStorage';
import type { SavedUserAddress } from '../../../services/api/usersApi';
import {
  applyShippingSelectionsToCart,
  getCartShippingTotal,
} from '../utils/applyShippingToCart';
import { isCartShippingPending } from '../utils/resolveCartShipping';
import {
  guestProfileToShippingAddress,
  resolveCartShippingContext,
} from '../utils/cartShippingIdentity';
import { persistCart } from '../utils/cartUtils';

interface UseCartShippingParams {
  cart: CartMap;
  /** Items selected for checkout — shipping rates are calculated for this subset only. */
  checkoutCart?: CartMap;
  user: AuthUser | null;
  authUserId?: string;
  replaceCart: (cart: CartMap) => void;
  setShippingTotals: (total: number, fetched: number) => void;
}

export function useCartShipping({
  cart,
  checkoutCart,
  user,
  authUserId,
  replaceCart,
  setShippingTotals,
}: UseCartShippingParams) {
  const ratesCart = checkoutCart ?? cart;
  const { userInfo } = usePricing();
  const guestCheckout = useGuestCheckoutIdentity(user);
  const authShipping = useAuthenticatedShippingAddress(user, authUserId);
  const [guestShippingAddress, setGuestShippingAddress] = useState<ShippingAddress>(emptyShippingAddress());
  const shippingAddress = authUserId ? authShipping.shippingAddress : guestShippingAddress;
  const setShippingAddress = authUserId ? authShipping.setShippingAddress : setGuestShippingAddress;
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [deliveryAddressSheetVisible, setDeliveryAddressSheetVisible] = useState(false);
  const [shippingOptionsSheetVisible, setShippingOptionsSheetVisible] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const lastAppliedSignature = useRef('');
  const cartCompositionKey = useMemo(
    () =>
      Object.entries(cart)
        .map(([itemId, line]) => `${itemId}:${line.orderQuantiy ?? 1}`)
        .sort()
        .join('|'),
    [cart],
  );
  const checkoutCompositionKey = useMemo(
    () =>
      Object.entries(ratesCart)
        .map(([itemId, line]) => `${itemId}:${line.orderQuantiy ?? 1}`)
        .sort()
        .join('|'),
    [ratesCart],
  );

  useEffect(() => {
    if (authUserId) {
      return;
    }

    if (guestCheckout.guestProfile) {
      setGuestShippingAddress(guestProfileToShippingAddress(guestCheckout.guestProfile));
    }
  }, [authUserId, guestCheckout.guestProfile]);

  const shippingContext = useMemo(() => {
    const context = resolveCartShippingContext({
      user,
      authUserId,
      guestProfile: guestCheckout.guestProfile,
      shippingAddress,
    });

    if (authUserId && authShipping.isLoading) {
      return {
        ...context,
        canFetchRates: false,
        needsDeliveryDetails: false,
      };
    }

    return context;
  }, [authShipping.isLoading, authUserId, guestCheckout.guestProfile, shippingAddress, user]);

  const {
    groups,
    selectedOptionBySeller,
    selectedOptions,
    selectedShippingCost,
    hasMultipleSellers,
    selectOption,
    isLoading,
    error,
    retry,
  } = useCheckoutShippingRates(
    ratesCart,
    shippingAddress,
    shippingContext.identity,
    shippingContext.canFetchRates,
    userInfo.country,
    userInfo.currencyRate ?? 1,
    userInfo.currency ?? 'CAD',
  );

  const persistCartShipping = useCallback(
    async (nextCart: CartMap, shippingTotal: number) => {
      if (authUserId) {
        await persistCart(authUserId, nextCart, {
          totalShippingRate: shippingTotal,
          fetchedShippingRate: shippingTotal,
        });
      } else {
        await saveGuestCart(nextCart);
      }

      setShippingTotals(shippingTotal, shippingTotal);
    },
    [authUserId, setShippingTotals],
  );

  useEffect(() => {
    if (!shippingContext.canFetchRates || selectedOptions.length === 0 || isLoading) {
      return;
    }

    const signature = selectedOptions
      .map((option) => `${option.sellerId}:${option.id}:${option.rate}`)
      .join('|');
    if (signature === lastAppliedSignature.current) {
      return;
    }

    const nextCart = applyShippingSelectionsToCart(cart, selectedOptions, groups, ratesCart);
    if (nextCart === cart) {
      lastAppliedSignature.current = signature;
      return;
    }

    const shippingTotal = getCartShippingTotal(nextCart) || selectedShippingCost;

    lastAppliedSignature.current = signature;
    replaceCart(nextCart);
    void persistCartShipping(nextCart, shippingTotal);
  }, [
    cart,
    groups,
    isLoading,
    persistCartShipping,
    replaceCart,
    selectedOptions,
    selectedShippingCost,
    shippingContext.canFetchRates,
    ratesCart,
  ]);

  useEffect(() => {
    lastAppliedSignature.current = '';
  }, [
    cartCompositionKey,
    checkoutCompositionKey,
    shippingAddress.city,
    shippingAddress.country,
    shippingAddress.state,
    shippingAddress.streetAddress,
    shippingAddress.zip,
  ]);

  const selectSavedAddress = useCallback(
    async (savedAddress: SavedUserAddress) => {
      await saveSelectedDeliveryAddress(savedAddress);
      const mapped = mapSavedUserAddressToShippingAddress(savedAddress);
      setShippingAddress((current) =>
        mergeShippingAddress(current, {
          ...mapped,
          email: mapped.email || user?.email?.trim() || current.email,
          phone:
            mapped.phone ||
            current.phone ||
            user?.phone?.trim() ||
            user?.moNumber?.trim() ||
            '',
        }),
      );
      lastAppliedSignature.current = '';
      setDeliveryAddressSheetVisible(false);

      if (authUserId) {
        void authShipping.reload();
      }
    },
    [authShipping.reload, authUserId, setShippingAddress, user?.email, user?.moNumber, user?.phone],
  );

  const openDeliveryDetails = useCallback(() => {
    if (user?.accessToken) {
      setAddressModalVisible(false);
      setDeliveryAddressSheetVisible(true);
      return;
    }

    setDeliveryAddressSheetVisible(false);
    setAddressModalVisible(true);
  }, [user?.accessToken]);

  const openShippingOptions = useCallback(() => {
    if (!shippingContext.canFetchRates || isLoading || groups.length === 0) {
      return;
    }

    setShippingOptionsSheetVisible(true);
  }, [groups.length, isLoading, shippingContext.canFetchRates]);

  const confirmShippingOptions = useCallback(
    (selections: Record<string, string>) => {
      Object.entries(selections).forEach(([sellerId, optionId]) => {
        selectOption(sellerId, optionId);
      });
      lastAppliedSignature.current = '';
      setShippingOptionsSheetVisible(false);
    },
    [selectOption],
  );

  const submitDeliveryDetails = useCallback(
    async (address: ShippingAddress) => {
      setIsSavingAddress(true);
      setAddressError(null);

      try {
        const validation = validateShippingAddress(address);
        if (!validation.isValid) {
          throw new Error('Complete all delivery fields before calculating shipping.');
        }

        setShippingAddress(address);

        if (!authUserId) {
          await guestCheckout.establishGuestCheckout(address);
        }

        setAddressModalVisible(false);
      } catch (err) {
        setAddressError(err instanceof Error ? err.message : 'Failed to save delivery details');
        throw err;
      } finally {
        setIsSavingAddress(false);
      }
    },
    [authUserId, guestCheckout],
  );

  const resolvedShippingCad = selectedShippingCost || getCartShippingTotal(ratesCart);

  const canProceedToCheckout =
    !authShipping.isLoading &&
    !shippingContext.needsDeliveryDetails &&
    !isLoading &&
    !error &&
    Object.keys(ratesCart).length > 0 &&
    !isCartShippingPending(ratesCart, selectedOptions);

  return {
    shippingAddress,
    shippingContext,
    groups,
    selectedOptionBySeller,
    selectedOptions,
    selectedShippingCost,
    hasMultipleSellers,
    selectOption,
    isLoading,
    error,
    retry,
    addressModalVisible,
    setAddressModalVisible,
    deliveryAddressSheetVisible,
    setDeliveryAddressSheetVisible,
    shippingOptionsSheetVisible,
    setShippingOptionsSheetVisible,
    openDeliveryDetails,
    openShippingOptions,
    confirmShippingOptions,
    selectSavedAddress,
    submitDeliveryDetails,
    isSavingAddress,
    addressError,
    canProceedToCheckout,
    isLoadingAuthAddress: authShipping.isLoading,
    authAddressError: authShipping.error,
    pricingCountry: userInfo.country,
  };
}
