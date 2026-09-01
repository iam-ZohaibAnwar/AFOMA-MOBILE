import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getShippingRates } from '../../../services/api/shippingApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { ShippingRateOption } from '../../../services/types/shipping';
import type { CartMap } from '../../../services/types/cart';
import type { CheckoutIdentity } from '../types/checkoutIdentity';
import type { ShippingAddress } from '../types/shippingAddress';
import {
  buildShippingUserInfo,
  getShippingBuyerCountry,
} from '../utils/buildShippingUserInfo';
import { buildSellerCartPayload, groupCartBySeller } from '../utils/cartShipping';
import { resolveAddressRegionCodes } from '../utils/resolveAddressRegionCodes';
import {
  applyShippingRateCurrency,
  formatShippingOptionLabel,
  getCheapestShippingOption,
  getShippingOptionId,
  normalizeShippingRate,
  sortShippingOptionsByRate,
} from '../utils/formatShippingOption';
import { buildShippingRatesRequestKey } from '../utils/shippingRatesRequestKey';
import { buildShippingGroupsFromCart } from '../utils/buildShippingGroupsFromCart';
import { extractSelectedShippingFromCart } from '../utils/extractSelectedShippingFromCart';
import { cartHasCarrierShippingOptions, isCartShippingPending } from '../../cart/utils/resolveCartShipping';
import {
  buildSelectedOptionsBySeller,
  getCachedShippingRates,
  mergeShippingRateGroup,
  setCachedShippingRates,
} from '../utils/shippingRatesCache';

export interface CheckoutShippingOption {
  id: string;
  sellerId: string;
  sellerName: string;
  option: ShippingRateOption;
  label: string;
  rate: number;
}

export interface SellerShippingOptionsGroup {
  sellerId: string;
  sellerName: string;
  options: CheckoutShippingOption[];
}

interface SellerCartGroup {
  sellerId: string;
  sellerName: string;
  lines: ReturnType<typeof groupCartBySeller>[number]['lines'];
}

function resolveSelectedOption(
  group: SellerShippingOptionsGroup,
  selectedOptionBySeller: Record<string, string>,
): CheckoutShippingOption | undefined {
  const selectedId = selectedOptionBySeller[group.sellerId];
  return (
    group.options.find((option) => option.id === selectedId) ??
    getCheapestShippingOption(group.options)
  );
}

function mapRateOptions(
  sellerGroup: SellerCartGroup,
  rateObj: ShippingRateOption[] | undefined,
  currencyRate: number,
  currency: string,
): CheckoutShippingOption[] {
  return sortShippingOptionsByRate(
    (rateObj ?? [])
      .filter((option) => option?.service_id != null)
      .map((option) => {
        const pricedOption = applyShippingRateCurrency(option, currencyRate, currency);

        return {
          id: getShippingOptionId(sellerGroup.sellerId, pricedOption),
          sellerId: sellerGroup.sellerId,
          sellerName: sellerGroup.sellerName,
          option: pricedOption,
          label: formatShippingOptionLabel(pricedOption),
          rate: normalizeShippingRate(pricedOption),
        };
      }),
  );
}

export function useCheckoutShippingRates(
  cart: CartMap,
  address: ShippingAddress,
  identity: CheckoutIdentity | null,
  canFetchRates: boolean,
  pricingCountry?: string,
  currencyRate = 1,
  currency = 'CAD',
) {
  const [groups, setGroups] = useState<SellerShippingOptionsGroup[]>([]);
  const [selectedOptionBySeller, setSelectedOptionBySeller] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cartRef = useRef(cart);
  const hasLoadedRatesRef = useRef(false);
  const lastRequestKeyRef = useRef<string | null>(null);
  const fetchGenerationRef = useRef(0);

  cartRef.current = cart;

  const requestKey = useMemo(
    () => buildShippingRatesRequestKey(cart, address, identity, canFetchRates, pricingCountry),
    [address, canFetchRates, cart, identity, pricingCountry],
  );

  const applyLoadedRates = useCallback(
    (
      nextGroups: SellerShippingOptionsGroup[],
      requestKeyForCache: string,
      mergeSelection = false,
    ) => {
      setGroups(nextGroups);
      setSelectedOptionBySeller((current) =>
        mergeSelection ? buildSelectedOptionsBySeller(nextGroups, current) : buildSelectedOptionsBySeller(nextGroups, {}),
      );
      setError(null);
      setIsLoading(false);
      hasLoadedRatesRef.current = nextGroups.length > 0;
      lastRequestKeyRef.current = requestKeyForCache;

      if (nextGroups.length > 0) {
        setCachedShippingRates(
          requestKeyForCache,
          nextGroups,
          buildSelectedOptionsBySeller(nextGroups, {}),
        );
      }
    },
    [],
  );

  const fetchRates = useCallback(async () => {
    const currentCart = cartRef.current;
    const currentRequestKey = buildShippingRatesRequestKey(
      currentCart,
      address,
      identity,
      canFetchRates,
      pricingCountry,
    );
    const fetchGeneration = ++fetchGenerationRef.current;

    if (!canFetchRates || !identity?.email?.trim()) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError(null);
      setIsLoading(false);
      hasLoadedRatesRef.current = false;
      return;
    }

    const sellerGroups = groupCartBySeller(currentCart);
    const shippableSellerGroups = sellerGroups
      .map((sellerGroup) => ({
        sellerId: sellerGroup.sellerId,
        sellerName: sellerGroup.sellerName,
        lines: sellerGroup.lines.filter((line) => line.productData?.productType !== 'Downloadable'),
      }))
      .filter((sellerGroup) => sellerGroup.lines.length > 0);

    if (shippableSellerGroups.length === 0) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError('No shippable cart items found.');
      setIsLoading(false);
      hasLoadedRatesRef.current = false;
      return;
    }

    setError(null);
    setIsLoading(true);
    setGroups([]);
    setSelectedOptionBySeller({});

    try {
      const regionCodes = resolveAddressRegionCodes({
        country: address.country,
        state: address.state,
        countryCode: identity?.countryCode,
        stateCode: identity?.stateCode,
      });
      const userInfo = buildShippingUserInfo(address, identity, regionCodes);
      const userCountry = getShippingBuyerCountry(pricingCountry);

      if (!userCountry) {
        throw new Error('Buyer country is unavailable for shipping quotes.');
      }

      if (!regionCodes.countryCode) {
        throw new Error('Enter a valid country name so we can calculate shipping.');
      }

      const settledGroups = await Promise.all(
        shippableSellerGroups.map(async (sellerGroup) => {
          const response = await getShippingRates({
            cart: buildSellerCartPayload(sellerGroup.lines),
            userInfo,
            userCountry,
          });

          const options = mapRateOptions(sellerGroup, response.rateObj, currencyRate, currency);
          if (options.length === 0) {
            return null;
          }

          const nextGroup: SellerShippingOptionsGroup = {
            sellerId: sellerGroup.sellerId,
            sellerName: sellerGroup.sellerName,
            options,
          };

          if (fetchGeneration !== fetchGenerationRef.current) {
            return nextGroup;
          }

          setGroups((current) => {
            const merged = mergeShippingRateGroup(current, nextGroup);
            setSelectedOptionBySeller((selection) => buildSelectedOptionsBySeller(merged, selection));
            return merged;
          });

          return nextGroup;
        }),
      );

      if (fetchGeneration !== fetchGenerationRef.current) {
        return;
      }

      const nextGroups = settledGroups.filter(Boolean) as SellerShippingOptionsGroup[];

      setGroups(nextGroups);
      setSelectedOptionBySeller(buildSelectedOptionsBySeller(nextGroups, {}));
      hasLoadedRatesRef.current = nextGroups.length > 0;
      lastRequestKeyRef.current = currentRequestKey;

      if (nextGroups.length > 0) {
        setCachedShippingRates(currentRequestKey, nextGroups, buildSelectedOptionsBySeller(nextGroups, {}));
      }

      if (nextGroups.length === 0) {
        setError('No shipping options are available for this address.');
      } else if (nextGroups.length < shippableSellerGroups.length) {
        setError('Shipping options are unavailable for one or more sellers.');
      } else {
        setError(null);
      }
    } catch (err) {
      if (fetchGeneration !== fetchGenerationRef.current) {
        return;
      }

      setGroups([]);
      setSelectedOptionBySeller({});
      hasLoadedRatesRef.current = false;
      setError(getErrorMessage(err, 'Failed to load shipping rates'));
    } finally {
      if (fetchGeneration === fetchGenerationRef.current) {
        setIsLoading(false);
      }
    }
  }, [address, canFetchRates, currency, currencyRate, identity, pricingCountry]);

  const hydrateRatesFromCart = useCallback((): boolean => {
    const currentCart = cartRef.current;

    if (!canFetchRates || !cartHasCarrierShippingOptions(currentCart)) {
      return false;
    }

    const hydrated = buildShippingGroupsFromCart(currentCart);
    const selectedFromCart = extractSelectedShippingFromCart(currentCart);

    if (
      hydrated.groups.length === 0 ||
      isCartShippingPending(currentCart, selectedFromCart, hydrated.groups)
    ) {
      return false;
    }

    setGroups(hydrated.groups);
    setSelectedOptionBySeller(hydrated.selectedOptionBySeller);
    setError(null);
    setIsLoading(false);
    hasLoadedRatesRef.current = true;
    return true;
  }, [canFetchRates]);

  const restoreRatesFromCache = useCallback(
    (key: string): boolean => {
      const cached = getCachedShippingRates(key);
      if (!cached) {
        return false;
      }

      applyLoadedRates(cached.groups, key);
      setSelectedOptionBySeller(cached.selectedOptionBySeller);
      return true;
    },
    [applyLoadedRates],
  );

  useEffect(() => {
    if (requestKey === 'disabled') {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError(null);
      setIsLoading(false);
      hasLoadedRatesRef.current = false;
      lastRequestKeyRef.current = null;
      return;
    }

    const isRefetch =
      lastRequestKeyRef.current != null && lastRequestKeyRef.current !== requestKey;

    if (isRefetch) {
      setGroups([]);
      setSelectedOptionBySeller({});
      hasLoadedRatesRef.current = false;
    }

    if (lastRequestKeyRef.current === requestKey && hasLoadedRatesRef.current) {
      return;
    }

    const isFreshMount = lastRequestKeyRef.current == null;

    if (!hasLoadedRatesRef.current && isFreshMount && restoreRatesFromCache(requestKey)) {
      return;
    }

    if (!hasLoadedRatesRef.current && isFreshMount && hydrateRatesFromCart()) {
      lastRequestKeyRef.current = requestKey;
      return;
    }

    if (!hasLoadedRatesRef.current) {
      setIsLoading(true);
    }

    lastRequestKeyRef.current = requestKey;

    const debounceMs = isRefetch ? 150 : 0;
    const timeoutId = setTimeout(() => {
      void fetchRates();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [fetchRates, hydrateRatesFromCart, requestKey, restoreRatesFromCache]);

  const selectOption = useCallback((sellerId: string, optionId: string) => {
    setSelectedOptionBySeller((current) => ({
      ...current,
      [sellerId]: optionId,
    }));
  }, []);

  const selectedOptions = useMemo(() => {
    return groups
      .map((group) => resolveSelectedOption(group, selectedOptionBySeller))
      .filter(Boolean) as CheckoutShippingOption[];
  }, [groups, selectedOptionBySeller]);

  const selectedShippingCost = useMemo(
    () => selectedOptions.reduce((sum, option) => sum + option.rate, 0),
    [selectedOptions],
  );

  const hasMultipleSellers = groups.length > 1;

  return {
    groups,
    selectedOptionBySeller,
    selectedOptions,
    selectedShippingCost,
    hasMultipleSellers,
    selectOption,
    isLoading,
    error,
    retry: fetchRates,
  };
}
