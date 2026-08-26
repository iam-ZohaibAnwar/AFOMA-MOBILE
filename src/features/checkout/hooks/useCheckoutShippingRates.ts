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
  getShippingOptionId,
  normalizeShippingRate,
} from '../utils/formatShippingOption';
import { buildShippingRatesRequestKey } from '../utils/shippingRatesRequestKey';

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

function buildDefaultSelections(groups: SellerShippingOptionsGroup[]): Record<string, string> {
  return groups.reduce<Record<string, string>>((selections, group) => {
    if (group.options[0]) {
      selections[group.sellerId] = group.options[0].id;
    }
    return selections;
  }, {});
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

  cartRef.current = cart;

  const requestKey = useMemo(
    () => buildShippingRatesRequestKey(cart, address, identity, canFetchRates, pricingCountry),
    [address, canFetchRates, cart, identity, pricingCountry],
  );

  const fetchRates = useCallback(async () => {
    const currentCart = cartRef.current;

    if (!canFetchRates || !identity?.email?.trim()) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError(null);
      setIsLoading(false);
      hasLoadedRatesRef.current = false;
      return;
    }

    const sellerGroups = groupCartBySeller(currentCart);
    if (sellerGroups.length === 0) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError('No shippable cart items found.');
      setIsLoading(false);
      hasLoadedRatesRef.current = false;
      return;
    }

    setError(null);

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

      const nextGroups: SellerShippingOptionsGroup[] = [];

      for (const sellerGroup of sellerGroups) {
        const shippableLines = sellerGroup.lines.filter(
          (line) => line.productData?.productType !== 'Downloadable',
        );

        if (shippableLines.length === 0) {
          continue;
        }

        const response = await getShippingRates({
          cart: buildSellerCartPayload(shippableLines),
          userInfo,
          userCountry,
        });

        const options = (response.rateObj ?? [])
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
          });

        if (options.length > 0) {
          nextGroups.push({
            sellerId: sellerGroup.sellerId,
            sellerName: sellerGroup.sellerName,
            options,
          });
        }
      }

      setGroups(nextGroups);
      setSelectedOptionBySeller((current) => {
        const defaults = buildDefaultSelections(nextGroups);
        const merged = { ...defaults };

        for (const group of nextGroups) {
          const existingSelection = current[group.sellerId];
          if (existingSelection && group.options.some((option) => option.id === existingSelection)) {
            merged[group.sellerId] = existingSelection;
          }
        }

        return merged;
      });
      hasLoadedRatesRef.current = nextGroups.length > 0;

      if (nextGroups.length === 0) {
        setError('No shipping options are available for this address.');
      }
    } catch (err) {
      setGroups([]);
      setSelectedOptionBySeller({});
      hasLoadedRatesRef.current = false;
      setError(getErrorMessage(err, 'Failed to load shipping rates'));
    } finally {
      setIsLoading(false);
    }
  }, [address, canFetchRates, currency, currencyRate, identity, pricingCountry]);

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

    const isRecalculating =
      lastRequestKeyRef.current !== null && lastRequestKeyRef.current !== requestKey;

    if (!hasLoadedRatesRef.current || isRecalculating) {
      setIsLoading(true);
    }

    lastRequestKeyRef.current = requestKey;

    const timeoutId = setTimeout(() => {
      void fetchRates();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [fetchRates, requestKey]);

  const selectOption = useCallback((sellerId: string, optionId: string) => {
    setSelectedOptionBySeller((current) => ({
      ...current,
      [sellerId]: optionId,
    }));
  }, []);

  const selectedOptions = useMemo(() => {
    return groups
      .map((group) => {
        const selectedId = selectedOptionBySeller[group.sellerId];
        return group.options.find((option) => option.id === selectedId) ?? group.options[0];
      })
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
