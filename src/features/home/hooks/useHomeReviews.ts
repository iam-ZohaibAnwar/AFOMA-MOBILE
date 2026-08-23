import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getBestReviews } from '../../../services/api/reviewsApi';
import type { Review } from '../../../services/types/review';

const HOME_REVIEWS_FETCH = 20;
const HOME_PREVIEW_LIMIT = 3;

function normalizeReviews(data: unknown): Review[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object' && 'reviews' in data) {
    return (data as { reviews?: Review[] }).reviews ?? [];
  }

  return [];
}

export function useHomeReviews(previewLimit = HOME_PREVIEW_LIMIT) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBestReviews(HOME_REVIEWS_FETCH);
      setReviews(normalizeReviews(response).slice(0, previewLimit));
    } catch (err) {
      setReviews([]);
      setError(getErrorMessage(err, 'Failed to load buyer reviews'));
    } finally {
      setIsLoading(false);
    }
  }, [previewLimit]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    isLoading,
    error,
    retry: loadReviews,
  };
}
