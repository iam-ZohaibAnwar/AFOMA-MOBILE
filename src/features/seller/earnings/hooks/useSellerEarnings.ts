import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getSellerDashboardPayoutSummary } from '../../../../services/api/sellerDashboardApi';
import { getErrorMessage } from '../../../../services/api/errors';
import type { SellerDashboardPayoutSummary } from '../../dashboard/types';
import { getSellerCommissionsPage } from '../api/sellerEarningsApi';
import type {
  SellerCommissionRecord,
  SellerEarningsPayoutStatusFilter,
} from '../types/sellerEarning';
import { commissionMatchesProductSearch } from '../utils/sellerEarningsDisplay';

const ITEMS_PER_PAGE = 10;

export function useSellerEarnings(
  sellerId?: string,
  initialStatusFilter: SellerEarningsPayoutStatusFilter = '',
) {
  const [commissions, setCommissions] = useState<SellerCommissionRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilterState] = useState<SellerEarningsPayoutStatusFilter>(
    initialStatusFilter,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [payoutSummary, setPayoutSummary] = useState<SellerDashboardPayoutSummary | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  const loadSummary = useCallback(async () => {
    if (!sellerId) {
      setPayoutSummary(null);
      setSummaryError(null);
      return;
    }

    try {
      const summary = await getSellerDashboardPayoutSummary(sellerId);
      setPayoutSummary(summary);
      setSummaryError(null);
    } catch (err) {
      setPayoutSummary(null);
      setSummaryError(getErrorMessage(err, 'Failed to load payout summary'));
    }
  }, [sellerId]);

  const loadCommissions = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!sellerId) {
        setCommissions([]);
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
        const response = await getSellerCommissionsPage(sellerId, {
          page,
          limit: ITEMS_PER_PAGE,
          payoutStatus: statusFilter || undefined,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setCommissions(Array.isArray(response.commissions) ? response.commissions : []);
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setCurrentPage(page);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setCommissions([]);
        setError(getErrorMessage(err, 'Failed to load seller earnings'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [sellerId, statusFilter],
  );

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadCommissions(1, 'initial');
  }, [loadCommissions]);

  const filteredCommissions = useMemo(
    () => commissions.filter((record) => commissionMatchesProductSearch(record, searchTerm)),
    [commissions, searchTerm],
  );

  const hasActiveFilters = Boolean(statusFilter);

  const setStatusFilter = useCallback((next: SellerEarningsPayoutStatusFilter) => {
    setStatusFilterState(next);
    setCurrentPage(1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    const nextPage = Math.max(1, currentPage - 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadCommissions(nextPage, 'initial');
  }, [currentPage, loadCommissions]);

  const goToNextPage = useCallback(() => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadCommissions(nextPage, 'initial');
  }, [currentPage, loadCommissions, totalPages]);

  const refresh = useCallback(async () => {
    await Promise.all([loadSummary(), loadCommissions(currentPage, 'refresh')]);
  }, [currentPage, loadCommissions, loadSummary]);

  const retrySummary = useCallback(async () => {
    await loadSummary();
  }, [loadSummary]);

  return {
    commissions: filteredCommissions,
    payoutSummary,
    currentPage,
    totalPages,
    statusFilter,
    searchTerm,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    setStatusFilter,
    setSearchTerm,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
