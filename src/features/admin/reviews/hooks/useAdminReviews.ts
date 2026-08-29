import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NavigationProp } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import {
  getAdminReviewById,
  getAdminReviewRepliesList,
  getAdminReviewsList,
  updateAdminReviewStatus,
} from '../api/adminReviewsApi';
import type {
  AdminReviewDetailRecord,
  AdminReviewListItem,
  AdminReviewListTabId,
  AdminReviewStatusFilter,
} from '../types/adminReviews';
import {
  applyAdminReviewSessionPatch,
  peekAdminReviewSessionPatches,
  setAdminReviewSessionPatch,
} from '../state/adminReviewSessionPatch';
import {
  buildAdminReviewCardActions,
} from '../utils/adminReviewCardActions';
import {
  filterAdminReviewsBySearch,
  canOpenAdminReviewProductPreview,
} from '../utils/adminReviewListDisplay';
import { ADMIN_REVIEW_LIST_PAGE_SIZE } from '../utils/adminReviewListTabs';
import { navigateToAdminReviewProductPreview } from '../utils/adminReviewProductPreview';
import {
  filterAdminReviewsByStatus,
  getAdminReviewTitle,
  mergeAdminReviewDetail,
  patchAdminReviewInList,
  patchAdminReviewListItem,
} from '../utils/adminReviewsContent';

const SEARCH_DEBOUNCE_MS = 300;

type AdminNavigation = NavigationProp<AdminStackParamList>;

interface UseAdminReviewsOptions {
  enabled: boolean;
}

export function useAdminReviews({ enabled }: UseAdminReviewsOptions) {
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [listTab, setListTab] = useState<AdminReviewListTabId>('customer');
  const [statusFilter, setStatusFilter] = useState<AdminReviewStatusFilter>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const reviewsRef = useRef<AdminReviewListItem[]>([]);

  reviewsRef.current = reviews;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listTab, statusFilter, searchTerm]);

  const filteredReviews = useMemo(() => {
    const byStatus =
      listTab === 'customer' ? filterAdminReviewsByStatus(reviews, statusFilter) : reviews;
    return filterAdminReviewsBySearch(byStatus, searchTerm);
  }, [listTab, reviews, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ADMIN_REVIEW_LIST_PAGE_SIZE));

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_REVIEW_LIST_PAGE_SIZE;
    return filteredReviews.slice(start, start + ADMIN_REVIEW_LIST_PAGE_SIZE);
  }, [currentPage, filteredReviews]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedReviews = reviewsRef.current.length > 0;

      if (mode === 'initial' && !hasCachedReviews) {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      }

      try {
        const nextReviews =
          listTab === 'seller-replies'
            ? await getAdminReviewRepliesList()
            : await getAdminReviewsList();

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setReviews(nextReviews.map((review) => applyAdminReviewSessionPatch(review) ?? review));
        setError(null);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!reviewsRef.current.length) {
          setError(getErrorMessage(loadError, 'Failed to load reviews'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled, listTab],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const applySessionPatchesToList = useCallback(() => {
    const patches = peekAdminReviewSessionPatches();
    if (patches.size === 0) {
      return;
    }

    setReviews((current) =>
      current.map((review) => {
        if (!review._id) {
          return review;
        }

        const patch = patches.get(review._id);
        if (!patch) {
          return review;
        }

        return patchAdminReviewListItem(review, patch);
      }),
    );
  }, []);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const updateStatus = useCallback(
    async (reviewId: string, newStatus: string): Promise<AdminReviewDetailRecord | null> => {
      if (!reviewId || updatingReviewId) {
        return null;
      }

      setUpdatingReviewId(reviewId);
      setActionError(null);

      try {
        const { review } = await updateAdminReviewStatus(reviewId, newStatus);
        setAdminReviewSessionPatch(reviewId, review);
        setReviews((current) => patchAdminReviewInList(current, reviewId, review));
        return review;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update review status'));
        return null;
      } finally {
        setUpdatingReviewId(null);
      }
    },
    [updatingReviewId],
  );

  const applyListTab = useCallback((nextTab: AdminReviewListTabId) => {
    setListTab(nextTab);
    if (nextTab === 'seller-replies') {
      setStatusFilter('');
    }
  }, []);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  const hasActiveFilters =
    Boolean(searchTerm) || (listTab === 'customer' && Boolean(statusFilter));

  return {
    reviews,
    filteredReviews,
    paginatedReviews,
    listTab,
    statusFilter,
    searchInput,
    setSearchInput,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    updatingReviewId,
    error,
    actionError,
    hasActiveFilters,
    refresh,
    applySessionPatchesToList,
    updateStatus,
    clearActionError,
    applyListTab,
    setStatusFilter,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}

interface UseAdminReviewCardActionsOptions {
  listTab: AdminReviewListTabId;
  onChangeStatus: (review: AdminReviewListItem) => void;
}

export function useAdminReviewCardActions(
  navigation: AdminNavigation,
  { listTab, onChangeStatus }: UseAdminReviewCardActionsOptions,
) {
  const [menuReview, setMenuReview] = useState<AdminReviewListItem | null>(null);

  const menuActions = useMemo(
    () =>
      menuReview
        ? buildAdminReviewCardActions(canOpenAdminReviewProductPreview(menuReview))
        : [],
    [menuReview],
  );

  const openMenu = useCallback((review: AdminReviewListItem) => {
    setMenuReview(review);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuReview(null);
  }, []);

  const handleView = useCallback(
    (review: AdminReviewListItem) => {
      if (!review._id) {
        return;
      }

      navigation.navigate('AdminReviewDetail', {
        reviewId: review._id,
        initialReview: review,
        listTab,
      });
    },
    [listTab, navigation],
  );

  const handleMenuAction = useCallback(
    (actionId: AdminProductCardActionId) => {
      const review = menuReview;
      closeMenu();

      if (!review) {
        return;
      }

      switch (actionId) {
        case 'view':
          handleView(review);
          break;
        case 'edit':
          onChangeStatus(review);
          break;
        case 'preview':
          navigateToAdminReviewProductPreview(navigation, review);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleView, menuReview, navigation, onChangeStatus],
  );

  return {
    menuReview,
    menuActions,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
  };
}

interface UseAdminReviewDetailOptions {
  reviewId?: string;
  initialReview?: AdminReviewListItem;
  enabled: boolean;
}

export function useAdminReviewDetail({
  reviewId,
  initialReview,
  enabled,
}: UseAdminReviewDetailOptions) {
  const [remoteReview, setRemoteReview] = useState<AdminReviewDetailRecord | null>(
    initialReview ?? null,
  );
  const [isRefreshing, setIsRefreshing] = useState(Boolean(reviewId && !initialReview));
  const [error, setError] = useState<string | null>(null);
  const remoteReviewRef = useRef<AdminReviewDetailRecord | null>(remoteReview);

  remoteReviewRef.current = remoteReview;

  const review = useMemo(
    () => mergeAdminReviewDetail(initialReview, remoteReview),
    [initialReview, remoteReview],
  );

  useEffect(() => {
    setRemoteReview(initialReview ?? null);
  }, [initialReview, reviewId]);

  const reload = useCallback(async () => {
    if (!enabled || !reviewId) {
      setRemoteReview(null);
      setError(null);
      setIsRefreshing(false);
      return;
    }

    const hasExistingReview = Boolean(initialReview ?? remoteReviewRef.current);
    if (!hasExistingReview) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const response = await getAdminReviewById(reviewId);
      setRemoteReview(response);
    } catch (err) {
      if (!hasExistingReview) {
        setRemoteReview(null);
        setError(getErrorMessage(err, 'Failed to load review'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh review'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, initialReview, reviewId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const applyReviewUpdate = useCallback((updated: AdminReviewDetailRecord) => {
    setRemoteReview((current) => mergeAdminReviewDetail(initialReview, updated));
  }, [initialReview]);

  return {
    review,
    isLoading: isRefreshing && !review,
    isRefreshing,
    error,
    reload,
    applyReviewUpdate,
  };
}

export function getAdminReviewMenuTitle(review: AdminReviewListItem): string {
  return `${getAdminReviewTitle(review)}`;
}
