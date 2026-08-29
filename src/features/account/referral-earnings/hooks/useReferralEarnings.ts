import { useCallback, useEffect, useRef, useState } from 'react';

import { getAffiliateCommissions } from '../../../../services/api/commissionApi';
import { getErrorMessage } from '../../../../services/api/errors';
import type { AffiliateCommissionRecord } from '../../../../services/types/commission';
import {
  buildReferralEarningsListCacheKey,
  getReferralEarningsListCache,
  getReferralEarningsSummaryCache,
  setReferralEarningsListCache,
  setReferralEarningsSummaryCache,
} from '../../../../services/cache/screenCache';
import type {
  ReferralEarningsPayoutStatusFilter,
  ReferralEarningsSummary,
} from '../types/referralEarning';
import { REFERRAL_EARNINGS_PAGE_SIZE } from '../utils/referralEarningsListTabs';
import {
  buildReferralEarningsSummary,
  EMPTY_REFERRAL_EARNINGS_SUMMARY,
} from '../utils/referralEarningsSummary';

const SUMMARY_FETCH_LIMIT = 100;

export function useReferralEarnings(userId?: string, initialStatusFilter: ReferralEarningsPayoutStatusFilter = '') {
  const listCacheKey = userId ? buildReferralEarningsListCacheKey(userId, 1, initialStatusFilter) : '';
  const cachedList = listCacheKey ? getReferralEarningsListCache(listCacheKey) : undefined;
  const cachedSummary = userId ? getReferralEarningsSummaryCache(userId) : undefined;

  const [commissions, setCommissions] = useState<AffiliateCommissionRecord[]>(cachedList?.commissions ?? []);
  const [currentPage, setCurrentPage] = useState(cachedList?.currentPage ?? 1);
  const [totalPages, setTotalPages] = useState(cachedList?.totalPages ?? 1);
  const [totalCount, setTotalCount] = useState(cachedList?.totalCount ?? 0);
  const [statusFilter, setStatusFilterState] = useState<ReferralEarningsPayoutStatusFilter>(initialStatusFilter);
  const [summary, setSummary] = useState<ReferralEarningsSummary | null>(cachedSummary ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(userId) && !cachedList);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);

  const loadSummary = useCallback(async () => {
    if (!userId) {
      setSummary(null);
      setSummaryError(null);
      return;
    }

    try {
      const [pendingResponse, paidResponse] = await Promise.all([
        getAffiliateCommissions(userId, {
          payoutStatus: 'Pending',
          page: 1,
          limit: SUMMARY_FETCH_LIMIT,
        }),
        getAffiliateCommissions(userId, {
          payoutStatus: 'Paid',
          page: 1,
          limit: SUMMARY_FETCH_LIMIT,
        }),
      ]);

      const nextSummary = buildReferralEarningsSummary(
        pendingResponse.commissions ?? [],
        paidResponse.commissions ?? [],
        pendingResponse.totalCount ?? 0,
        paidResponse.totalCount ?? 0,
      );

      setSummary(nextSummary);
      setSummaryError(null);
      setReferralEarningsSummaryCache(userId, nextSummary);
    } catch (err) {
      setSummary(null);
      setSummaryError(getErrorMessage(err, 'Failed to load referral summary'));
    }
  }, [userId]);

  const loadCommissions = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!userId) {
        setCommissions([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!getReferralEarningsListCache(buildReferralEarningsListCacheKey(userId, page, statusFilter))) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getAffiliateCommissions(userId, {
          page,
          limit: REFERRAL_EARNINGS_PAGE_SIZE,
          payoutStatus: statusFilter || undefined,
        });

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextCommissions = Array.isArray(response.commissions) ? response.commissions : [];
        const nextTotalPages = Math.max(1, response.totalPages ?? 1);
        const nextTotalCount = response.totalCount ?? nextCommissions.length;

        setCommissions(nextCommissions);
        setTotalPages(nextTotalPages);
        setTotalCount(nextTotalCount);
        setCurrentPage(page);

        setReferralEarningsListCache(
          buildReferralEarningsListCacheKey(userId, page, statusFilter),
          {
            commissions: nextCommissions,
            totalPages: nextTotalPages,
            totalCount: nextTotalCount,
            currentPage: page,
            statusFilter,
          },
        );
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setCommissions([]);
        setError(getErrorMessage(err, 'Failed to load referral earnings'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [statusFilter, userId],
  );

  useEffect(() => {
    if (!cachedSummary) {
      void loadSummary();
    }
  }, [cachedSummary, loadSummary]);

  useEffect(() => {
    void loadCommissions(1, 'initial');
  }, [loadCommissions]);

  const hasActiveFilters = Boolean(statusFilter);

  const setStatusFilter = useCallback((next: ReferralEarningsPayoutStatusFilter) => {
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
    commissions,
    summary: summary ?? EMPTY_REFERRAL_EARNINGS_SUMMARY,
    totalCount,
    currentPage,
    totalPages,
    statusFilter,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    setStatusFilter,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1 && !isLoading,
    canGoNext: currentPage < totalPages && !isLoading,
  };
}
