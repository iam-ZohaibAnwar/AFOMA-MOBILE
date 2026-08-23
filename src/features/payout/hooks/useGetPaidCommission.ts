import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getPayoutCommissionById } from '../api/payoutCommissionApi';
import type { PayoutCommissionDetail } from '../types/payoutCommission';

export function useGetPaidCommission(commissionId: string | null) {
  const [commission, setCommission] = useState<PayoutCommissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(commissionId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!commissionId) {
      setCommission(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getPayoutCommissionById(commissionId);
      setCommission(response);
    } catch (err) {
      setCommission(null);
      setError(getErrorMessage(err, 'Failed to load payout details'));
    } finally {
      setIsLoading(false);
    }
  }, [commissionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    commission,
    isLoading,
    error,
    reload,
  };
}
