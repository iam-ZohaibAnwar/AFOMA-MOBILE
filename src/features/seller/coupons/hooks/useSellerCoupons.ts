import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { deleteSellerCoupon, getSellerCouponsPage } from '../api/sellerCouponsApi';
import type { SellerCoupon } from '../types/sellerCoupon';

const ITEMS_PER_PAGE = 10;

export function useSellerCoupons(userId?: string) {
  const [coupons, setCoupons] = useState<SellerCoupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const loadingMoreRef = useRef(false);
  const requestVersionRef = useRef(0);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (!userId) {
        setCoupons([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'more') {
        if (loadingMoreRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getSellerCouponsPage(userId, {
          page,
          limit: ITEMS_PER_PAGE,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextCoupons = Array.isArray(response.coupons) ? response.coupons : [];

        setCoupons((current) => (mode === 'more' ? [...current, ...nextCoupons] : nextCoupons));
        setCurrentPage(response.currentPage ?? page);
        setTotalPages(response.totalPages ?? 1);
        setTotalCoupons(response.totalCoupons ?? nextCoupons.length);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (mode !== 'more') {
          setCoupons([]);
        }
        setError(getErrorMessage(err, 'Failed to load coupons'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    void loadPage(1, 'initial');
  }, [loadPage]);

  const hasMore = currentPage < totalPages;

  const refresh = useCallback(async () => {
    await loadPage(1, 'refresh');
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isLoadingMore || isRefreshing) {
      return;
    }

    void loadPage(currentPage + 1, 'more');
  }, [currentPage, hasMore, isLoading, isLoadingMore, isRefreshing, loadPage]);

  const removeCoupon = useCallback(async (couponId: string): Promise<boolean> => {
    setDeletingCouponId(couponId);
    setDeleteError(null);

    try {
      await deleteSellerCoupon(couponId);
      setCoupons((current) => current.filter((coupon) => coupon._id !== couponId));
      setTotalCoupons((count) => Math.max(0, count - 1));
      return true;
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete coupon'));
      return false;
    } finally {
      setDeletingCouponId(null);
    }
  }, []);

  return {
    coupons,
    totalCoupons,
    currentPage,
    totalPages,
    hasMore,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    deleteError,
    deletingCouponId,
    refresh,
    loadMore,
    removeCoupon,
    clearDeleteError: () => setDeleteError(null),
  };
}
