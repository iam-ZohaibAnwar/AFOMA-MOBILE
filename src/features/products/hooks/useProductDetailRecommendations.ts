import { useEffect, useMemo, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import {
  getProductsByCategory,
  getProductsByIds,
  getProductsBySellerId,
} from '../../../services/api/productsApi';
import type { Product } from '../../../services/types/product';
import { addRecentlyViewedProductId } from '../../../services/storage/recentlyViewedStorage';
import { applyProductPricing, filterApprovedProducts } from '../utils/productDisplay';

const SELLER_RECOMMENDATIONS_LIMIT = 3;
const RELATED_PRODUCTS_LIMIT = 6;
const RECENTLY_VIEWED_LIMIT = 3;

function filterSellerRecommendations(
  products: Product[],
  productId: string,
  sellerId: string | undefined,
  viewedIds: Set<string>,
): Product[] {
  if (!sellerId) {
    return [];
  }

  return filterApprovedProducts(products)
    .filter(
      (item) =>
        item._id !== productId &&
        item.seller?._id === sellerId &&
        !viewedIds.has(item._id ?? ''),
    )
    .slice(0, SELLER_RECOMMENDATIONS_LIMIT);
}

function filterRelatedProducts(
  products: Product[],
  productId: string,
  sellerId: string | undefined,
  viewedIds: Set<string>,
): Product[] {
  return filterApprovedProducts(products)
    .filter(
      (item) =>
        item._id !== productId &&
        item.seller?._id !== sellerId &&
        !viewedIds.has(item._id ?? ''),
    )
    .slice(0, RELATED_PRODUCTS_LIMIT);
}

function filterRecentlyViewedProducts(products: Product[], productId: string): Product[] {
  return filterApprovedProducts(products)
    .filter((item) => item._id !== productId)
    .slice(0, RECENTLY_VIEWED_LIMIT);
}

export function useProductDetailRecommendations(product: Product | null) {
  const { userInfo } = usePricing();
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  const productId = product?._id;
  const sellerId = product?.seller?._id;
  const categoryName = product?.Category?.name?.trim();

  useEffect(() => {
    if (!productId) {
      setSellerProducts([]);
      setRelatedProducts([]);
      setRecentlyViewedProducts([]);
      return;
    }

    let cancelled = false;

    const loadRecommendations = async () => {
      const viewedIds = await addRecentlyViewedProductId(productId);
      const viewedIdSet = new Set(viewedIds);

      const sellerPromise = sellerId
        ? getProductsBySellerId(sellerId, { page: 1, limit: 12 })
        : Promise.resolve<Product[]>([]);
      const categoryPromise = categoryName
        ? getProductsByCategory(categoryName)
        : Promise.resolve<Product[]>([]);
      const recentlyViewedPromise =
        viewedIds.length > 2
          ? getProductsByIds(viewedIds)
          : Promise.resolve<Product[]>([]);

      try {
        const [sellerRaw, categoryRaw, recentlyViewedRaw] = await Promise.all([
          sellerPromise,
          categoryPromise,
          recentlyViewedPromise,
        ]);

        if (cancelled) {
          return;
        }

        setSellerProducts(filterSellerRecommendations(sellerRaw, productId, sellerId, viewedIdSet));
        setRelatedProducts(filterRelatedProducts(categoryRaw, productId, sellerId, viewedIdSet));
        setRecentlyViewedProducts(filterRecentlyViewedProducts(recentlyViewedRaw, productId));
      } catch {
        if (!cancelled) {
          setSellerProducts([]);
          setRelatedProducts([]);
          setRecentlyViewedProducts([]);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [categoryName, productId, sellerId]);

  const pricedSellerProducts = useMemo(
    () => applyProductPricing(sellerProducts, userInfo),
    [sellerProducts, userInfo],
  );
  const pricedRelatedProducts = useMemo(
    () => applyProductPricing(relatedProducts, userInfo),
    [relatedProducts, userInfo],
  );
  const pricedRecentlyViewedProducts = useMemo(
    () => applyProductPricing(recentlyViewedProducts, userInfo),
    [recentlyViewedProducts, userInfo],
  );

  return {
    sellerProducts: pricedSellerProducts,
    relatedProducts: pricedRelatedProducts,
    recentlyViewedProducts: pricedRecentlyViewedProducts,
  };
}
