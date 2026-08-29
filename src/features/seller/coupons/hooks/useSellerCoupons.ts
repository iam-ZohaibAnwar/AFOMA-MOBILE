import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Alert } from 'react-native';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminProductCardActionId } from '../../../admin/product-management/components/AdminProductCardActionsMenu';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { deleteSellerCoupon, getAllSellerCoupons, getSellerCoupon } from '../api/sellerCouponsApi';
import {
  navigateToSellerCouponDetail,
  navigateToSellerCouponForm,
} from '../navigation/sellerCouponsNavigation';
import type { SellerCoupon, SellerCouponStatusFilter } from '../types/sellerCoupon';
import { buildSellerCouponCardActions } from '../utils/sellerCouponCardActions';
import {
  filterSellerCouponsBySearch,
  filterSellerCouponsByStatus,
  getSellerCouponMenuTitle,
  removeSellerCouponFromList,
} from '../utils/sellerCouponListDisplay';
import { SELLER_COUPON_LIST_PAGE_SIZE } from '../utils/sellerCouponListTabs';
import { mapSellerCouponToFormValues } from '../utils/sellerCouponValidation';

const SEARCH_DEBOUNCE_MS = 300;

type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

interface UseSellerCouponListOptions {
  userId?: string;
  enabled: boolean;
}

export function useSellerCouponList({ userId, enabled }: UseSellerCouponListOptions) {
  const [allCoupons, setAllCoupons] = useState<SellerCoupon[]>([]);
  const [statusFilter, setStatusFilter] = useState<SellerCouponStatusFilter>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);
  const allCouponsRef = useRef<SellerCoupon[]>([]);

  allCouponsRef.current = allCoupons;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const filteredCoupons = useMemo(() => {
    const byStatus = filterSellerCouponsByStatus(allCoupons, statusFilter);
    return filterSellerCouponsBySearch(byStatus, searchTerm);
  }, [allCoupons, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / SELLER_COUPON_LIST_PAGE_SIZE));

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * SELLER_COUPON_LIST_PAGE_SIZE;
    return filteredCoupons.slice(start, start + SELLER_COUPON_LIST_PAGE_SIZE);
  }, [currentPage, filteredCoupons]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const hasActiveFilters = Boolean(searchTerm || statusFilter);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled || !userId) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedCoupons = allCouponsRef.current.length > 0;

      if (mode === 'initial' && !hasCachedCoupons) {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      }

      setError(null);

      try {
        const nextCoupons = await getAllSellerCoupons(userId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setAllCoupons(nextCoupons);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!allCouponsRef.current.length) {
          setAllCoupons([]);
          setError(getErrorMessage(loadError, 'Failed to load coupons'));
        } else {
          setError(getErrorMessage(loadError, 'Unable to refresh coupons'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled, userId],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  const deleteCoupon = useCallback(
    async (couponId: string): Promise<boolean> => {
      if (!couponId || deletingCouponId) {
        return false;
      }

      setDeletingCouponId(couponId);
      setActionError(null);

      try {
        await deleteSellerCoupon(couponId);
        setAllCoupons((current) => removeSellerCouponFromList(current, couponId));
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
    coupons: paginatedCoupons,
    filteredCount: filteredCoupons.length,
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    currentPage,
    totalPages,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    deletingCouponId,
    error,
    actionError,
    refresh,
    clearActionError,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    deleteCoupon,
  };
}

interface UseSellerCouponCardActionsOptions {
  deletingCouponId: string | null;
  onDeleteCoupon: (couponId: string) => Promise<boolean>;
}

export function useSellerCouponCardActions(
  navigation: SellerNavigation,
  { deletingCouponId, onDeleteCoupon }: UseSellerCouponCardActionsOptions,
) {
  const [menuCoupon, setMenuCoupon] = useState<SellerCoupon | null>(null);

  const menuActions = useMemo(() => buildSellerCouponCardActions(), []);

  const openMenu = useCallback((coupon: SellerCoupon) => {
    setMenuCoupon(coupon);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuCoupon(null);
  }, []);

  const handleView = useCallback(
    (coupon: SellerCoupon) => {
      if (!coupon._id) {
        return;
      }

      navigateToSellerCouponDetail(navigation, coupon._id, coupon);
    },
    [navigation],
  );

  const handleEdit = useCallback(
    (coupon: SellerCoupon) => {
      if (!coupon._id) {
        return;
      }

      navigateToSellerCouponForm(navigation, {
        couponId: coupon._id,
        initialCoupon: coupon,
      });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (coupon: SellerCoupon) => {
      const couponId = coupon._id;
      if (!couponId) {
        return;
      }

      Alert.alert(
        'Delete coupon?',
        `This will permanently remove ${getSellerCouponMenuTitle(coupon)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void onDeleteCoupon(couponId);
            },
          },
        ],
      );
    },
    [onDeleteCoupon],
  );

  const handleMenuAction = useCallback(
    (actionId: AdminProductCardActionId) => {
      const coupon = menuCoupon;
      closeMenu();

      if (!coupon) {
        return;
      }

      switch (actionId) {
        case 'view':
          handleView(coupon);
          break;
        case 'edit':
          handleEdit(coupon);
          break;
        case 'delete':
          handleDelete(coupon);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleDelete, handleEdit, handleView, menuCoupon],
  );

  return {
    menuCoupon,
    menuActions,
    menuTitle: menuCoupon ? getSellerCouponMenuTitle(menuCoupon) : undefined,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
    busyCouponId: deletingCouponId,
  };
}

interface UseSellerCouponDetailOptions {
  couponId?: string;
  initialCoupon?: SellerCoupon;
  enabled: boolean;
}

export function useSellerCouponDetail({
  couponId,
  initialCoupon,
  enabled,
}: UseSellerCouponDetailOptions) {
  const [remoteCoupon, setRemoteCoupon] = useState<SellerCoupon | null>(initialCoupon ?? null);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(couponId && !initialCoupon));
  const [error, setError] = useState<string | null>(null);
  const remoteCouponRef = useRef<SellerCoupon | null>(remoteCoupon);

  remoteCouponRef.current = remoteCoupon;

  const coupon = remoteCoupon ?? initialCoupon ?? null;

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
      const response = await getSellerCoupon(couponId);
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

  return {
    coupon,
    isLoading: isRefreshing && !coupon,
    isRefreshing,
    error,
    reload,
  };
}

/** @deprecated Use useSellerCouponList instead. */
export function useSellerCoupons(userId?: string) {
  return useSellerCouponList({ userId, enabled: Boolean(userId) });
}
