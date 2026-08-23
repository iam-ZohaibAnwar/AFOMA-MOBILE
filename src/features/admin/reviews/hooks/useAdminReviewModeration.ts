import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { updateAdminReviewStatus } from '../api/adminReviewsApi';
import { setAdminReviewSessionPatch } from '../state/adminReviewSessionPatch';
import type { AdminReviewDetailRecord } from '../types/adminReviews';

export function useAdminReviewModeration(reviewId?: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateStatus = useCallback(
    async (newStatus: string): Promise<AdminReviewDetailRecord | null> => {
      if (!reviewId || isUpdating) {
        return null;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const { review } = await updateAdminReviewStatus(reviewId, newStatus);
        setAdminReviewSessionPatch(reviewId, review);
        return review;
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update review status'));
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [isUpdating, reviewId],
  );

  return {
    isUpdating,
    error,
    updateStatus,
    clearError,
  };
}
