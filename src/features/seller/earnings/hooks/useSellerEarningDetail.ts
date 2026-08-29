import { useCallback, useEffect, useState } from 'react';

import type { SellerCommissionRecord } from '../types/sellerEarning';

export function useSellerEarningDetail({
  commissionId,
  initialRecord,
  enabled,
}: {
  commissionId: string;
  initialRecord?: SellerCommissionRecord;
  enabled: boolean;
}) {
  const [record, setRecord] = useState<SellerCommissionRecord | null>(initialRecord ?? null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecord(initialRecord ?? null);
    setError(null);
  }, [commissionId, initialRecord]);

  const refresh = useCallback(async () => {
    if (!enabled || !commissionId) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      if (initialRecord) {
        setRecord(initialRecord);
      } else {
        setError('Earning details are unavailable.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [commissionId, enabled, initialRecord]);

  return {
    record,
    isRefreshing,
    error,
    refresh,
  };
}
