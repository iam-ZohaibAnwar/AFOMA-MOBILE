import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerReviewsPage } from '../api/sellerReviewsApi';
import type { SellerReviewListItem } from '../types/sellerReview';

const ITEMS_PER_PAGE = 10;

export function useSellerReviews(sellerId?: string) {
  const [reviews, setReviews] = useState<SellerReviewListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  const loadReviews = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!sellerId) {
        setReviews([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getSellerReviewsPage(sellerId, {
          page,
          limit: ITEMS_PER_PAGE,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setReviews(Array.isArray(response.data) ? response.data : []);
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setCurrentPage(page);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setReviews([]);
        setError(getErrorMessage(err, 'Failed to load seller reviews'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [sellerId],
  );

  useEffect(() => {
    void loadReviews(1, 'initial');
  }, [loadReviews]);

  const refresh = useCallback(async () => {
    await loadReviews(currentPage, 'refresh');
  }, [currentPage, loadReviews]);

  const goToPreviousPage = useCallback(() => {
    const nextPage = Math.max(1, currentPage - 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadReviews(nextPage, 'initial');
  }, [currentPage, loadReviews]);

  const goToNextPage = useCallback(() => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadReviews(nextPage, 'initial');
  }, [currentPage, loadReviews, totalPages]);

  return {
    reviews,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
