import { useCallback, useEffect, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createProductShippingEstimate,
  getProductShippingEstimateDestinations,
} from '../../../../services/api/shippingApi';
import type {
  ProductShippingEstimateCarrierResult,
  ProductShippingDestination,
} from '../../../../services/types/shipping';
import type { ProductShippingEstimateFormValues } from '../types/productShippingEstimate';
import {
  buildProductShippingEstimateRequest,
  validateProductShippingEstimateForm,
} from '../utils/productShippingEstimateMappers';

export function useProductShippingEstimate(
  sellerId: string | undefined,
  visible: boolean,
  price?: string,
) {
  const [destinations, setDestinations] = useState<ProductShippingDestination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);
  const [isFetchingEstimate, setIsFetchingEstimate] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [dhlEstimate, setDhlEstimate] = useState<ProductShippingEstimateCarrierResult | null>(null);
  const [freightComEstimate, setFreightComEstimate] =
    useState<ProductShippingEstimateCarrierResult | null>(null);

  const destinationOptions = useMemo(
    () =>
      destinations.map((destination) => ({
        label: destination.name,
        value: destination.code,
      })),
    [destinations],
  );

  const loadDestinations = useCallback(async () => {
    if (!sellerId) {
      setDestinations([]);
      setDestinationsError('Seller ID unavailable.');
      return;
    }

    setIsLoadingDestinations(true);
    setDestinationsError(null);

    try {
      const response = await getProductShippingEstimateDestinations(sellerId);
      setDestinations(response.destinations ?? []);
    } catch (err) {
      setDestinations([]);
      setDestinationsError(getErrorMessage(err, 'Could not load destination countries'));
    } finally {
      setIsLoadingDestinations(false);
    }
  }, [sellerId]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setEstimateError(null);
    setDhlEstimate(null);
    setFreightComEstimate(null);
    void loadDestinations();
  }, [loadDestinations, visible]);

  const fetchEstimate = useCallback(
    async (values: ProductShippingEstimateFormValues) => {
      if (!sellerId) {
        setEstimateError('Seller ID unavailable.');
        return false;
      }

      const validationError = validateProductShippingEstimateForm(values);
      if (validationError) {
        setEstimateError(validationError);
        return false;
      }

      setIsFetchingEstimate(true);
      setEstimateError(null);
      setDhlEstimate(null);
      setFreightComEstimate(null);

      try {
        const response = await createProductShippingEstimate(
          buildProductShippingEstimateRequest({ sellerId, values, price }),
        );

        setDhlEstimate(response.estimate ?? null);
        setFreightComEstimate(response.freightComEstimate ?? null);
        return true;
      } catch (err) {
        setEstimateError(getErrorMessage(err, 'Failed to fetch shipping estimate'));
        return false;
      } finally {
        setIsFetchingEstimate(false);
      }
    },
    [price, sellerId],
  );

  const resetResults = useCallback(() => {
    setEstimateError(null);
    setDhlEstimate(null);
    setFreightComEstimate(null);
  }, []);

  return {
    destinationOptions,
    isLoadingDestinations,
    destinationsError,
    isFetchingEstimate,
    estimateError,
    dhlEstimate,
    freightComEstimate,
    fetchEstimate,
    resetResults,
    reloadDestinations: loadDestinations,
  };
}
