import { useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getErrorMessage } from '../../../services/api/errors';
import { getDiscountedProducts } from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { applyProductPricing, getProductRouteId } from '../../products/utils/productDisplay';
import { normalizeFlatProductList } from '../../home/utils/homeProducts';

const FETCH_LIMIT = 12;
const DISPLAY_LIMIT = 3;

function buildExcludedIdsKey(excludedProductIds: string[]): string {
  return [...new Set(excludedProductIds.filter(Boolean))].sort().join('|');
}

export function useCartRecommendations(excludedProductIds: string[]) {
  const { userInfo } = usePricing();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadedRequestKeyRef = useRef<string | null>(null);
  const hasDisplayedProductsRef = useRef(false);

  const excludedIdsKey = useMemo(
    () => buildExcludedIdsKey(excludedProductIds),
    [excludedProductIds],
  );

  const pricingKey = `${userInfo.currency ?? 'CAD'}:${userInfo.currencyRate ?? 1}:${userInfo.country ?? ''}`;
  const requestKey = `${excludedIdsKey}::${pricingKey}`;

  useEffect(() => {
    if (requestKey === loadedRequestKeyRef.current) {
      return;
    }

    let cancelled = false;
    const showLoading = !hasDisplayedProductsRef.current;

    if (showLoading) {
      setIsLoading(true);
    }

    void (async () => {
      try {
        const response = await getDiscountedProducts(FETCH_LIMIT);
        const normalized = normalizeFlatProductList(response);
        const priced = applyProductPricing(normalized, userInfo);
        const excludedIds = new Set(
          excludedIdsKey ? excludedIdsKey.split('|').filter(Boolean) : [],
        );
        const filtered = priced.filter((product) => {
          const id = getProductRouteId(product);
          return id ? !excludedIds.has(id) : true;
        });
        const nextProducts = filtered.slice(0, DISPLAY_LIMIT);

        if (cancelled) {
          return;
        }

        setProducts(nextProducts);
        hasDisplayedProductsRef.current = nextProducts.length > 0;
        loadedRequestKeyRef.current = requestKey;
      } catch (err) {
        if (cancelled) {
          return;
        }

        setProducts([]);
        hasDisplayedProductsRef.current = false;
        loadedRequestKeyRef.current = requestKey;
        if (__DEV__) {
          console.warn(getErrorMessage(err, 'Failed to load cart recommendations'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [excludedIdsKey, pricingKey, requestKey, userInfo]);

  return {
    products,
    isLoading,
  };
}
