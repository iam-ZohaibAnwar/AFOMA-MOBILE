import { useCallback, useEffect, useState } from 'react';

import {
  getSellerDashboardLatestOrders,
  getSellerDashboardOrderCounts,
  getSellerDashboardPayoutSummary,
} from '../../../../services/api/sellerDashboardApi';
import { getErrorMessage } from '../../../../services/api/errors';
import type {
  SellerDashboardOrder,
  SellerDashboardOrderCounts,
  SellerDashboardPayoutSummary,
} from '../types';
import { filterDashboardLatestOrders } from '../../utils/sellerDashboardDisplay';

export interface SellerDashboardErrors {
  counts?: string;
  payouts?: string;
  orders?: string;
}

export function useSellerDashboard(sellerId?: string) {
  const [orderCounts, setOrderCounts] = useState<SellerDashboardOrderCounts | null>(null);
  const [payoutSummary, setPayoutSummary] = useState<SellerDashboardPayoutSummary | null>(null);
  const [latestOrders, setLatestOrders] = useState<SellerDashboardOrder[]>([]);
  const [errors, setErrors] = useState<SellerDashboardErrors>({});
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (refreshing = false) => {
      if (!sellerId) {
        setOrderCounts(null);
        setPayoutSummary(null);
        setLatestOrders([]);
        setErrors({});
        setIsLoading(false);
        return;
      }

      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const nextErrors: SellerDashboardErrors = {};

      const [countsResult, payoutsResult, ordersResult] = await Promise.allSettled([
        getSellerDashboardOrderCounts(sellerId),
        getSellerDashboardPayoutSummary(sellerId),
        getSellerDashboardLatestOrders(sellerId),
      ]);

      if (countsResult.status === 'fulfilled') {
        setOrderCounts(countsResult.value);
      } else {
        setOrderCounts(null);
        nextErrors.counts = getErrorMessage(countsResult.reason, 'Failed to load order counts');
      }

      if (payoutsResult.status === 'fulfilled') {
        setPayoutSummary(payoutsResult.value);
      } else {
        setPayoutSummary(null);
        nextErrors.payouts = getErrorMessage(payoutsResult.reason, 'Failed to load payout summary');
      }

      if (ordersResult.status === 'fulfilled') {
        setLatestOrders(filterDashboardLatestOrders(ordersResult.value));
      } else {
        setLatestOrders([]);
        nextErrors.orders = getErrorMessage(ordersResult.reason, 'Failed to load recent orders');
      }

      setErrors(nextErrors);
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [sellerId],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const hasAnyData = Boolean(orderCounts || payoutSummary || latestOrders.length > 0);
  const hasBlockingError = Boolean(errors.counts && errors.payouts && errors.orders && !hasAnyData);

  return {
    orderCounts,
    payoutSummary,
    latestOrders,
    errors,
    isLoading,
    isRefreshing,
    hasBlockingError,
    reload: () => loadDashboard(true),
    refresh: () => loadDashboard(true),
  };
}
