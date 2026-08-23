import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAffiliateCommissions } from '../../../services/api/commissionApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { AffiliateCommissionRecord } from '../../../services/types/commission';

const ITEMS_PER_PAGE = 10;

export function useReferralEarnings(userId?: string) {
  const [commissions, setCommissions] = useState<AffiliateCommissionRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  const loadEarnings = useCallback(async () => {
    if (!userId) {
      setCommissions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAffiliateCommissions(userId);
      setCommissions(Array.isArray(response.commissions) ? response.commissions : []);
      setCurrentPage(1);
    } catch (err) {
      setCommissions([]);
      setError(getErrorMessage(err, 'Failed to load referral earnings'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadEarnings();
  }, [loadEarnings]);

  const totalPages = Math.max(1, Math.ceil(commissions.length / ITEMS_PER_PAGE));

  const paginatedCommissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return commissions.slice(start, start + ITEMS_PER_PAGE);
  }, [commissions, currentPage]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  return {
    commissions,
    paginatedCommissions,
    totalEarnings: commissions.length,
    currentPage,
    totalPages,
    isLoading,
    error,
    retry: loadEarnings,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}
