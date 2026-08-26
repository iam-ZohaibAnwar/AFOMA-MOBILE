import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import {
  getProductAverageReview,
  getProductReviews,
} from '../../../services/api/reviewsApi';

import type { Review } from '../../../services/types/review';

function normalizeAverageRating(data: Record<string, unknown>): number | undefined {
  const candidates = [data.avgValue, data.avgRating, data.averageRating, data.rating];

  for (const candidate of candidates) {
    const value = typeof candidate === 'number' ? candidate : Number(candidate);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return undefined;
}

export function useProductReviews(productId?: string) {
  const [averageRating, setAverageRating] = useState<number | undefined>();
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(productId));

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setAverageRating(undefined);
      setReviewCount(0);
      setReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [averageResponse, reviewsResponse] = await Promise.all([
        getProductAverageReview(productId),
        getProductReviews(productId),
      ]);

      const normalizedReviews = Array.isArray(reviewsResponse) ? reviewsResponse : [];

      setAverageRating(normalizeAverageRating(averageResponse));
      setReviews(normalizedReviews);
      setReviewCount(normalizedReviews.filter((review) => !review.isReply).length);
    } catch (err) {
      setAverageRating(undefined);
      setReviewCount(0);
      setReviews([]);
      if (__DEV__) {
        console.warn(getErrorMessage(err, 'Failed to load product reviews'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  return {
    averageRating,
    reviewCount,
    reviews,
    isLoading,
    retry: loadReviews,
  };
}
