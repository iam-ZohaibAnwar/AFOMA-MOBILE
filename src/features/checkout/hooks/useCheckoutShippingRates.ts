import { useCallback, useEffect, useMemo, useState } from 'react';

import { getShippingRates } from '../../../services/api/shippingApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { ShippingRateOption } from '../../../services/types/shipping';
import type { CartMap } from '../../../services/types/cart';
import type { AuthUser } from '../../auth/types';
import type { ShippingAddress } from '../types/shippingAddress';
import {
  buildShippingUserInfo,
  getShippingUserCountry,
} from '../utils/buildShippingUserInfo';
import { buildSellerCartPayload, groupCartBySeller } from '../utils/cartShipping';
import {
  formatShippingOptionLabel,
  getShippingOptionId,
  normalizeShippingRate,
} from '../utils/formatShippingOption';

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
  user: AuthUser | null,
  canFetchRates: boolean,
) {
  const [groups, setGroups] = useState<SellerShippingOptionsGroup[]>([]);
  const [selectedOptionBySeller, setSelectedOptionBySeller] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    if (!user || !canFetchRates) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError(null);
      setIsLoading(false);
      return;
    }

    const sellerGroups = groupCartBySeller(cart);
    if (sellerGroups.length === 0) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError('No shippable cart items found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userInfo = buildShippingUserInfo(address, user);
      const userCountry = getShippingUserCountry(address, user);
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
          .map((option) => ({
            id: getShippingOptionId(sellerGroup.sellerId, option),
            sellerId: sellerGroup.sellerId,
            sellerName: sellerGroup.sellerName,
            option,
            label: formatShippingOptionLabel(option),
            rate: normalizeShippingRate(option),
          }));

        if (options.length > 0) {
          nextGroups.push({
            sellerId: sellerGroup.sellerId,
            sellerName: sellerGroup.sellerName,
            options,
          });
        }
      }

      setGroups(nextGroups);
      setSelectedOptionBySeller(buildDefaultSelections(nextGroups));

      if (nextGroups.length === 0) {
        setError('No shipping options are available for this address.');
      }
    } catch (err) {
      setGroups([]);
      setSelectedOptionBySeller({});
      setError(getErrorMessage(err, 'Failed to load shipping rates'));
    } finally {
      setIsLoading(false);
    }
  }, [address, canFetchRates, cart, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchRates();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [fetchRates]);

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
