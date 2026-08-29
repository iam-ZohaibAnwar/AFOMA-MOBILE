import { useCallback, useEffect, useState } from 'react';

import type { ReferralCommissionRecord } from '../types/referralEarning';

export function useReferralEarningDetail({
  commissionId,
  initialRecord,
  enabled,
}: {
  commissionId: string;
  initialRecord?: ReferralCommissionRecord;
  enabled: boolean;
}) {
  const [record, setRecord] = useState<ReferralCommissionRecord | null>(initialRecord ?? null);
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
        setError('Referral earning details are unavailable.');
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
