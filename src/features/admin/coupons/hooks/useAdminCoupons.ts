import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCouponById,
  getAdminCouponsPage,
  updateAdminCoupon,
} from '../api/adminCouponsApi';
import type {
  AdminCouponDetailRecord,
  AdminCouponListItem,
  CreateAdminCouponPayload,
  UpdateAdminCouponPayload,
} from '../types/adminCoupons';
import {
  mergeAdminCouponDetail,
  patchAdminCouponInList,
  removeAdminCouponFromList,
} from '../utils/adminCouponsContent';

const DEFAULT_PAGE_SIZE = 10;

interface UseAdminCouponsOptions {
  adminUserId?: string;
  enabled: boolean;
}

export function useAdminCoupons({ adminUserId, enabled }: UseAdminCouponsOptions) {
  const [coupons, setCoupons] = useState<AdminCouponListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled && Boolean(adminUserId));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadingMoreRef = useRef(false);
  const requestVersionRef = useRef(0);
  const couponsRef = useRef<AdminCouponListItem[]>([]);

  couponsRef.current = coupons;

  const applyListResponse = useCallback(
    (response: Awaited<ReturnType<typeof getAdminCouponsPage>>, page: number, mode: 'replace' | 'append') => {
      const nextCoupons = Array.isArray(response.coupons) ? response.coupons : [];

      setCoupons((current) => (mode === 'append' ? [...current, ...nextCoupons] : nextCoupons));
      setCurrentPage(response.page ?? page);
      setTotalPages(response.totalPages ?? 1);
      setTotalCount(response.totalCount ?? nextCoupons.length);
    },
    [],
  );

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'more' | 'refresh') => {
      if (!enabled || !adminUserId) {
        setCoupons([]);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedCoupons = couponsRef.current.length > 0;

      if (mode === 'more') {
        if (loadingMoreRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedCoupons) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getAdminCouponsPage(adminUserId, {
          page,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        applyListResponse(response, page, mode === 'more' ? 'append' : 'replace');
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (mode !== 'more') {
          if (!couponsRef.current.length) {
            setCoupons([]);
          }
          setError(getErrorMessage(loadError, 'Failed to load coupons'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          setIsRefreshing(false);
          loadingMoreRef.current = false;
        }
      }
    },
    [adminUserId, applyListResponse, enabled],
  );

  useEffect(() => {
    void loadPage(1, 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(1, 'refresh');
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (currentPage >= totalPages || isLoadingMore) {
      return;
    }

    await loadPage(currentPage + 1, 'more');
  }, [currentPage, isLoadingMore, loadPage, totalPages]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const createCoupon = useCallback(
    async (payload: CreateAdminCouponPayload): Promise<AdminCouponDetailRecord | null> => {
      if (!adminUserId || isMutating) {
        return null;
      }

      setIsMutating(true);
      setActionError(null);

      try {
        const { coupon } = await createAdminCoupon(payload);
        await refresh();
        return coupon;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to create coupon'));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [adminUserId, isMutating, refresh],
  );

  const updateCoupon = useCallback(
    async (
      couponId: string,
      payload: UpdateAdminCouponPayload,
    ): Promise<AdminCouponDetailRecord | null> => {
      if (!couponId || isMutating) {
        return null;
      }

      setIsMutating(true);
      setActionError(null);

      try {
        const updated = await updateAdminCoupon(couponId, payload);
        setCoupons((current) => patchAdminCouponInList(current, couponId, updated));
        return updated;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update coupon'));
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [isMutating],
  );

  const deleteCoupon = useCallback(
    async (couponId: string): Promise<boolean> => {
      if (!couponId || deletingCouponId) {
        return false;
      }

      setDeletingCouponId(couponId);
      setActionError(null);

      try {
        await deleteAdminCoupon(couponId);
        setCoupons((current) => removeAdminCouponFromList(current, couponId));
        setTotalCount((current) => Math.max(0, current - 1));
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to delete coupon'));
        return false;
      } finally {
        setDeletingCouponId(null);
      }
    },
    [deletingCouponId],
  );

  return {
    coupons,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isMutating,
    deletingCouponId,
    error,
    actionError,
    refresh,
    loadMore,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    clearActionError,
  };
}

interface UseAdminCouponDetailOptions {
  couponId?: string;
  initialCoupon?: AdminCouponListItem;
  enabled: boolean;
}

export function useAdminCouponDetail({
  couponId,
  initialCoupon,
  enabled,
}: UseAdminCouponDetailOptions) {
  const [remoteCoupon, setRemoteCoupon] = useState<AdminCouponDetailRecord | null>(
    initialCoupon ?? null,
  );
  const [isRefreshing, setIsRefreshing] = useState(Boolean(couponId && !initialCoupon));
  const [error, setError] = useState<string | null>(null);
  const remoteCouponRef = useRef<AdminCouponDetailRecord | null>(remoteCoupon);

  remoteCouponRef.current = remoteCoupon;

  const coupon = mergeAdminCouponDetail(initialCoupon, remoteCoupon);

  useEffect(() => {
    setRemoteCoupon(initialCoupon ?? null);
  }, [initialCoupon, couponId]);

  const reload = useCallback(async () => {
    if (!enabled || !couponId) {
      setRemoteCoupon(null);
      setError(null);
      setIsRefreshing(false);
      return;
    }

    const hasExistingCoupon = Boolean(initialCoupon ?? remoteCouponRef.current);
    if (!hasExistingCoupon) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const response = await getAdminCouponById(couponId);
      setRemoteCoupon(response);
    } catch (err) {
      if (!hasExistingCoupon) {
        setRemoteCoupon(null);
        setError(getErrorMessage(err, 'Failed to load coupon'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh coupon'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [couponId, enabled, initialCoupon]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyCouponUpdate = useCallback((updated: AdminCouponDetailRecord) => {
    setRemoteCoupon(updated);
  }, []);

  return {
    coupon,
    isLoading: isRefreshing && !coupon,
    isRefreshing,
    error,
    reload,
    applyCouponUpdate,
  };
}
