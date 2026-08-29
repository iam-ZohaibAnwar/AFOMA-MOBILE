import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerReviewDetail } from '../api/sellerReviewsApi';
import type { SellerReviewDetail, SellerReviewListItem } from '../types/sellerReview';

export function useSellerReviewDetail(reviewId?: string, initialReview?: SellerReviewListItem) {
  const [review, setReview] = useState<SellerReviewDetail | null>(initialReview ?? null);
  const [isRefreshing, setIsRefreshing] = useState(Boolean(reviewId && !initialReview));
  const [error, setError] = useState<string | null>(null);
  const reviewRef = useRef(review);

  reviewRef.current = review;

  const reload = useCallback(async () => {
    if (!reviewId) {
      setReview(null);
      setError(null);
      setIsRefreshing(false);
      return;
    }

    const hasExistingReview = Boolean(reviewRef.current);
    if (!hasExistingReview) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const response = await getSellerReviewDetail(reviewId);
      setReview(response);
    } catch (err) {
      if (!hasExistingReview) {
        setReview(null);
        setError(getErrorMessage(err, 'Failed to load review'));
      } else {
        setError(getErrorMessage(err, 'Unable to refresh review.'));
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [reviewId]);

  useEffect(() => {
    setReview(initialReview ?? null);
  }, [initialReview, reviewId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    review,
    isLoading: isRefreshing && !review,
    isRefreshing,
    error,
    reload,
    applyReviewUpdate: setReview,
  };
}
