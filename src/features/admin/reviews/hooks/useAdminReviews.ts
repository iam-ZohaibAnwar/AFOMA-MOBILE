import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  getAdminReviewById,
  getAdminReviewsList,
  updateAdminReviewStatus,
} from '../api/adminReviewsApi';
import type {
  AdminReviewDetailRecord,
  AdminReviewListItem,
  AdminReviewStatusFilter,
} from '../types/adminReviews';
import {
  applyAdminReviewSessionPatch,
  peekAdminReviewSessionPatches,
  setAdminReviewSessionPatch,
} from '../state/adminReviewSessionPatch';
import {
  filterAdminReviewsByStatus,
  mergeAdminReviewDetail,
  patchAdminReviewInList,
  patchAdminReviewListItem,
} from '../utils/adminReviewsContent';

interface UseAdminReviewsOptions {
  enabled: boolean;
}

export function useAdminReviews({ enabled }: UseAdminReviewsOptions) {
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<AdminReviewStatusFilter>('');
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingReviewId, setUpdatingReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const reviewsRef = useRef<AdminReviewListItem[]>([]);

  reviewsRef.current = reviews;

  const filteredReviews = useMemo(
    () => filterAdminReviewsByStatus(reviews, statusFilter),
    [reviews, statusFilter],
  );

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
        const nextReviews = await getAdminReviewsList();

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
    [enabled],
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

  return {
    reviews,
    filteredReviews,
    statusFilter,
    setStatusFilter,
    isLoading,
    isRefreshing,
    updatingReviewId,
    error,
    actionError,
    refresh,
    applySessionPatchesToList,
    updateStatus,
    clearActionError,
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
