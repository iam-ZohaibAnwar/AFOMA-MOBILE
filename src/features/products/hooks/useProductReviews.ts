import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import {
  getProductAverageReview,
  getProductReviews,
} from '../../../services/api/reviewsApi';

import type { Review } from '../../../services/types/review';

export interface ProductReviewAverages {
  avgValue?: number;
  avgQuality?: number;
  avgPrice?: number;
}

function pickAverageField(data: Record<string, unknown>, key: string): number | undefined {
  const raw = data[key];
  const value = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function normalizeReviewAverages(data: Record<string, unknown>): ProductReviewAverages {
  return {
    avgValue: pickAverageField(data, 'avgValue'),
    avgQuality: pickAverageField(data, 'avgQuality'),
    avgPrice: pickAverageField(data, 'avgPrice'),
  };
}

function normalizeAverageRating(
  data: Record<string, unknown>,
  averages: ProductReviewAverages,
): number | undefined {
  const candidates = [data.avgValue, data.avgRating, data.averageRating, data.rating];

  for (const candidate of candidates) {
    const value = typeof candidate === 'number' ? candidate : Number(candidate);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  const breakdownValues = [averages.avgValue, averages.avgQuality, averages.avgPrice].filter(
    (value): value is number => typeof value === 'number',
  );

  if (breakdownValues.length === 0) {
    return undefined;
  }

  return breakdownValues.reduce((sum, value) => sum + value, 0) / breakdownValues.length;
}

export function useProductReviews(productId?: string) {
  const [averageRating, setAverageRating] = useState<number | undefined>();
  const [reviewAverages, setReviewAverages] = useState<ProductReviewAverages>({});
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(productId));

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setAverageRating(undefined);
      setReviewAverages({});
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
      const averages = normalizeReviewAverages(averageResponse);

      setReviewAverages(averages);
      setAverageRating(normalizeAverageRating(averageResponse, averages));
      setReviews(normalizedReviews);
      setReviewCount(normalizedReviews.filter((review) => !review.isReply).length);
    } catch (err) {
      setAverageRating(undefined);
      setReviewAverages({});
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
    reviewAverages,
    reviewCount,
    reviews,
    isLoading,
    retry: loadReviews,
  };
}
