import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePricing } from '../../../app/providers/PricingProvider';
import { getShopCache, setShopCache } from '../../../services/cache/screenCache';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';
import type { Review } from '../../../services/types/review';
import type { Seller } from '../../../services/types/seller';
import {
  applyProductPricing,
  filterApprovedProducts,
} from '../../products/utils/productDisplay';
import {
  getSellerReviewsList,
  getSellerProductsPage,
  getSellerStoreBySlug,
} from '../api/shopApi';
import { createPlaceholderSeller, isSellerShopPaused } from '../utils/sellerDisplay';

const PRODUCTS_PAGE_SIZE = 12;

export type ShopTab = 'products' | 'reviews' | 'about';

function hydrateShopState(slug: string) {
  const cached = getShopCache(slug);

  return {
    seller: cached?.seller ?? createPlaceholderSeller(slug),
    products: cached?.products ?? [],
    reviews: cached?.reviews ?? [],
    sellerId: cached?.seller?._id ?? null,
    isRefreshing: !cached,
  };
}

function areSameProducts(left: Product[], right: Product[]): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  return left.every((product, index) => product === right[index] || product._id === right[index]?._id);
}

export function useShopScreen(slug: string) {
  const { userInfo } = usePricing();
  const initialState = useMemo(() => hydrateShopState(slug), [slug]);

  const [seller, setSeller] = useState<Seller>(initialState.seller);
  const [rawProducts, setRawProducts] = useState<Product[]>(initialState.products);
  const [reviews, setReviews] = useState<Review[]>(initialState.reviews);
  const [activeTab, setActiveTab] = useState<ShopTab>('products');
  const [isRefreshing, setIsRefreshing] = useState(initialState.isRefreshing);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const activeSlugRef = useRef(slug);
  const sellerIdRef = useRef<string | null>(initialState.sellerId);

  const products = useMemo(
    () => applyProductPricing(rawProducts, userInfo),
    [rawProducts, userInfo],
  );

  useEffect(() => {
    activeSlugRef.current = slug;
    const nextState = hydrateShopState(slug);

    setSeller((current) =>
      current._id === nextState.seller._id &&
      current.storeSlug === nextState.seller.storeSlug &&
      current.storeTitle === nextState.seller.storeTitle
        ? current
        : nextState.seller,
    );
    setRawProducts((current) =>
      areSameProducts(current, nextState.products) ? current : nextState.products,
    );
    setReviews((current) => (current === nextState.reviews ? current : nextState.reviews));
    setActiveTab('products');
    setError(null);
    setHasMore(false);
    setPage(1);
    sellerIdRef.current = nextState.sellerId;
    setIsRefreshing((current) =>
      current === nextState.isRefreshing ? current : nextState.isRefreshing,
    );
  }, [slug]);

  const loadProducts = useCallback(
    async (sellerId: string, pageNum: number, append: boolean, requestSlug: string) => {
      const result = await getSellerProductsPage(sellerId, {
        page: pageNum,
        limit: PRODUCTS_PAGE_SIZE,
      });

      if (activeSlugRef.current !== requestSlug) {
        return [];
      }

      const approved = filterApprovedProducts(result.products);

      setRawProducts((current) => {
        const next = append ? [...current, ...approved] : approved;
        return areSameProducts(current, next) ? current : next;
      });
      setHasMore(Boolean(result.pagination?.hasNextPage));
      setPage(pageNum);

      return approved;
    },
    [],
  );

  const loadShop = useCallback(async () => {
    const requestSlug = slug;
    const cached = getShopCache(requestSlug);
    const hasExistingData = Boolean(cached?.seller?._id) || (cached?.products?.length ?? 0) > 0;

    if (!hasExistingData) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const sellerData = await getSellerStoreBySlug(requestSlug);
      if (activeSlugRef.current !== requestSlug) {
        return;
      }

      if (sellerData.userRole && sellerData.userRole !== 'seller') {
        throw new Error('This storefront is unavailable.');
      }

      setSeller((current) => (current._id === sellerData._id ? { ...current, ...sellerData } : sellerData));

      const sellerId = sellerData._id;
      if (!sellerId) {
        throw new Error('Seller profile is missing an ID.');
      }

      sellerIdRef.current = sellerId;

      let nextProducts = cached?.products ?? [];
      if (!isSellerShopPaused(sellerData)) {
        nextProducts = await loadProducts(sellerId, 1, false, requestSlug);
      } else {
        setRawProducts((current) => (current.length === 0 ? current : []));
        setHasMore(false);
        setPage(1);
        nextProducts = [];
      }

      if (activeSlugRef.current !== requestSlug) {
        return;
      }

      const reviewsResult = await getSellerReviewsList(sellerId);
      setReviews(reviewsResult.reviews);

      setShopCache(requestSlug, {
        seller: sellerData,
        products: nextProducts,
        reviews: reviewsResult.reviews,
      });
    } catch (err) {
      if (activeSlugRef.current !== requestSlug) {
        return;
      }

      if (!hasExistingData) {
        setError(getErrorMessage(err, 'Failed to load shop'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh shop. Showing saved content.'));
      }
    } finally {
      if (activeSlugRef.current === requestSlug) {
        setIsRefreshing(false);
      }
    }
  }, [loadProducts, slug]);

  useEffect(() => {
    void loadShop();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when slug changes

  const loadMoreProducts = useCallback(async () => {
    const sellerId = sellerIdRef.current;
    if (!sellerId || isLoadingMore || !hasMore || isSellerShopPaused(seller)) {
      return;
    }

    setIsLoadingMore(true);
    try {
      await loadProducts(sellerId, page + 1, true, slug);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load more products'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, loadProducts, page, seller, slug]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.avgRating ?? review.value ?? 0), 0) /
        reviews.length
      : undefined;

  return {
    seller,
    products,
    reviews,
    activeTab,
    setActiveTab,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    isPaused: isSellerShopPaused(seller),
    averageRating,
    retry: loadShop,
    loadMoreProducts,
  };
}
