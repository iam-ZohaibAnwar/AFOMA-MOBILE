import { useCallback, useEffect, useState } from 'react';

import {
  clearAppliedCoupon,
  loadAppliedCoupon,
  saveAppliedCoupon,
} from '../../../services/storage/appliedCouponStorage';
import type { AppliedCoupon } from '../../../services/types/coupon';

export function useAppliedCoupon(userId: string | undefined) {
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setAppliedCoupon(null);
      setIsHydrated(true);
      return;
    }

    setIsHydrated(false);

    void loadAppliedCoupon(userId).then((coupon) => {
      if (!cancelled) {
        setAppliedCoupon(coupon);
        setIsHydrated(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persistAppliedCoupon = useCallback(
    async (coupon: AppliedCoupon | null) => {
      setAppliedCoupon(coupon);

      if (!userId) {
        return;
      }

      if (coupon?.couponCode) {
        await saveAppliedCoupon(userId, coupon);
        return;
      }

      await clearAppliedCoupon(userId);
    },
    [userId],
  );

  const removeAppliedCoupon = useCallback(async () => {
    setAppliedCoupon(null);

    if (userId) {
      await clearAppliedCoupon(userId);
    }
  }, [userId]);

  return {
    appliedCoupon,
    isHydrated,
    persistAppliedCoupon,
    removeAppliedCoupon,
    setAppliedCoupon,
  };
}
