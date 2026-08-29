import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerReviewsPage } from '../api/sellerReviewsApi';
import type {
  SellerReviewListItem,
  SellerReviewReplyFilter,
  SellerReviewStatusFilter,
} from '../types/sellerReview';
import {
  filterSellerReviewsByReply,
  filterSellerReviewsBySearch,
  filterSellerReviewsByStatus,
} from '../utils/sellerReviewListDisplay';
import { SELLER_REVIEW_PAGE_SIZE } from '../utils/sellerReviewListTabs';

const SEARCH_DEBOUNCE_MS = 300;

export function useSellerReviews(sellerId?: string) {
  const [reviews, setReviews] = useState<SellerReviewListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SellerReviewStatusFilter>('');
  const [replyFilter, setReplyFilter] = useState<SellerReviewReplyFilter>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

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
          limit: SELLER_REVIEW_PAGE_SIZE,
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

  const filteredReviews = useMemo(() => {
    const byStatus = filterSellerReviewsByStatus(reviews, statusFilter);
    const byReply = filterSellerReviewsByReply(byStatus, replyFilter);
    return filterSellerReviewsBySearch(byReply, searchTerm);
  }, [replyFilter, reviews, searchTerm, statusFilter]);

  const hasActiveFilters = Boolean(statusFilter || replyFilter);

  const setStatusFilterAndReset = useCallback((next: SellerReviewStatusFilter) => {
    setStatusFilter(next);
  }, []);

  const setReplyFilterAndReset = useCallback((next: SellerReviewReplyFilter) => {
    setReplyFilter(next);
  }, []);

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
    reviews: filteredReviews,
    rawReviewCount: reviews.length,
    currentPage,
    totalPages,
    statusFilter,
    replyFilter,
    searchInput,
    setSearchInput,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    setStatusFilter: setStatusFilterAndReset,
    setReplyFilter: setReplyFilterAndReset,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
