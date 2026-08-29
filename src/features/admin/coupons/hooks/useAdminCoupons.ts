import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminAllCoupons,
  getAdminCouponById,
  notifyAdminCouponUsers,
  updateAdminCoupon,
} from '../api/adminCouponsApi';
import type {
  AdminCouponDetailRecord,
  AdminCouponListItem,
  AdminCouponListTabId,
  AdminCouponStatusFilter,
  CreateAdminCouponPayload,
  UpdateAdminCouponPayload,
} from '../types/adminCoupons';
import { buildAdminCouponCardActions } from '../utils/adminCouponCardActions';
import {
  filterAdminCouponsBySearch,
  filterAdminCouponsByStatus,
  filterAdminCouponsByTab,
  getAdminCouponMenuTitle,
} from '../utils/adminCouponListDisplay';
import { ADMIN_COUPON_LIST_PAGE_SIZE } from '../utils/adminCouponListTabs';
import {
  mergeAdminCouponDetail,
  patchAdminCouponInList,
  removeAdminCouponFromList,
} from '../utils/adminCouponsContent';
import {
  navigateToAdminCouponDetail,
  navigateToAdminCouponForm,
} from '../navigation/adminCouponsNavigation';

const SEARCH_DEBOUNCE_MS = 300;

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

interface UseAdminCouponListOptions {
  adminUserId?: string;
  enabled: boolean;
}

export function useAdminCouponList({ adminUserId, enabled }: UseAdminCouponListOptions) {
  const [allCoupons, setAllCoupons] = useState<AdminCouponListItem[]>([]);
  const [listTab, setListTab] = useState<AdminCouponListTabId>('admin');
  const [statusFilter, setStatusFilter] = useState<AdminCouponStatusFilter>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [notifyingCouponId, setNotifyingCouponId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);
  const allCouponsRef = useRef<AdminCouponListItem[]>([]);

  allCouponsRef.current = allCoupons;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listTab, statusFilter, searchTerm]);

  const filteredCoupons = useMemo(() => {
    const byTab = filterAdminCouponsByTab(allCoupons, listTab, adminUserId);
    const byStatus = filterAdminCouponsByStatus(byTab, statusFilter);
    return filterAdminCouponsBySearch(byStatus, searchTerm);
  }, [adminUserId, allCoupons, listTab, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / ADMIN_COUPON_LIST_PAGE_SIZE));

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_COUPON_LIST_PAGE_SIZE;
    return filteredCoupons.slice(start, start + ADMIN_COUPON_LIST_PAGE_SIZE);
  }, [currentPage, filteredCoupons]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const hasActiveFilters = Boolean(searchTerm || statusFilter);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
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
        const nextCoupons = await getAdminAllCoupons();

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setAllCoupons(Array.isArray(nextCoupons) ? nextCoupons : []);
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
    [enabled],
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
        setAllCoupons((current) => patchAdminCouponInList(current, couponId, updated));
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
        setAllCoupons((current) => removeAdminCouponFromList(current, couponId));
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

  const notifyCoupon = useCallback(
    async (couponId: string): Promise<boolean> => {
      if (!couponId || notifyingCouponId) {
        return false;
      }

      setNotifyingCouponId(couponId);
      setActionError(null);

      try {
        await notifyAdminCouponUsers(couponId);
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to send coupon notification'));
        return false;
      } finally {
        setNotifyingCouponId(null);
      }
    },
    [notifyingCouponId],
  );

  return {
    coupons: paginatedCoupons,
    filteredCount: filteredCoupons.length,
    listTab,
    setListTab,
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    currentPage,
    totalPages,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    isMutating,
    deletingCouponId,
    notifyingCouponId,
    error,
    actionError,
    refresh,
    clearActionError,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    notifyCoupon,
  };
}

interface UseAdminCouponCardActionsOptions {
  listTab: AdminCouponListTabId;
  deletingCouponId: string | null;
  notifyingCouponId: string | null;
  onDeleteCoupon: (couponId: string) => Promise<boolean>;
  onNotifyCoupon: (couponId: string) => Promise<boolean>;
  onListChanged: () => void;
}

export function useAdminCouponCardActions(
  navigation: AdminNavigation,
  {
    listTab,
    deletingCouponId,
    notifyingCouponId,
    onDeleteCoupon,
    onNotifyCoupon,
    onListChanged,
  }: UseAdminCouponCardActionsOptions,
) {
  const [menuCoupon, setMenuCoupon] = useState<AdminCouponListItem | null>(null);

  const menuActions = useMemo(
    () => (menuCoupon ? buildAdminCouponCardActions(menuCoupon) : []),
    [menuCoupon],
  );

  const openMenu = useCallback((coupon: AdminCouponListItem) => {
    setMenuCoupon(coupon);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuCoupon(null);
  }, []);

  const handleView = useCallback(
    (coupon: AdminCouponListItem) => {
      if (!coupon._id) {
        return;
      }

      navigateToAdminCouponDetail(navigation, coupon._id, coupon);
    },
    [navigation],
  );

  const handleEdit = useCallback(
    (coupon: AdminCouponListItem) => {
      if (!coupon._id) {
        return;
      }

      navigateToAdminCouponForm(navigation, {
        couponId: coupon._id,
        initialCoupon: coupon,
      });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (coupon: AdminCouponListItem) => {
      const couponId = coupon._id;
      if (!couponId) {
        return;
      }

      Alert.alert(
        'Delete coupon?',
        `This will permanently remove ${getAdminCouponMenuTitle(coupon)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void onDeleteCoupon(couponId).then((deleted) => {
                if (deleted) {
                  onListChanged();
                }
              });
            },
          },
        ],
      );
    },
    [onDeleteCoupon, onListChanged],
  );

  const handleNotify = useCallback(
    (coupon: AdminCouponListItem) => {
      const couponId = coupon._id;
      if (!couponId) {
        return;
      }

      Alert.alert(
        'Notify users',
        `Send a marketplace notification for ${getAdminCouponMenuTitle(coupon)}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Notify',
            onPress: () => {
              void onNotifyCoupon(couponId);
            },
          },
        ],
      );
    },
    [onNotifyCoupon],
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
        case 'preview':
          handleNotify(coupon);
          break;
        case 'delete':
          handleDelete(coupon);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleDelete, handleEdit, handleNotify, handleView, menuCoupon],
  );

  const busyCouponId = deletingCouponId ?? notifyingCouponId;

  return {
    menuCoupon,
    menuActions,
    menuTitle: menuCoupon ? getAdminCouponMenuTitle(menuCoupon) : undefined,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
    busyCouponId,
    listTab,
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

/** @deprecated Use useAdminCouponList instead. */
export function useAdminCoupons(options: UseAdminCouponListOptions) {
  return useAdminCouponList(options);
}
