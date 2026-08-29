import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  getAdminLatestProducts,
  getAdminLatestSellers,
  getAdminPendingOrdersCount,
  getAdminPendingPayoutCount,
  getAdminPendingProductCount,
  getAdminPopularSearchTerms,
  getAdminProductStockStatus,
  getAdminSellerTotalCount,
  getAdminTotalOrdersCount,
  getAdminTotalSales,
  getAdminUserCounts,
} from '../api/adminDashboardApi';
import type {
  AdminDashboardErrors,
  AdminLatestProduct,
  AdminLatestSeller,
  AdminPendingOrdersCount,
  AdminPendingPayoutCount,
  AdminPendingProductCount,
  AdminPopularSearchTerm,
  AdminProductStockStatus,
  AdminSellerTotalCount,
  AdminTotalOrdersCount,
  AdminTotalSalesSummary,
  AdminUserCounts,
} from '../types/adminDashboard';

export function useAdminDashboard(fullAccess: boolean) {
  const [totalSales, setTotalSales] = useState<AdminTotalSalesSummary | null>(null);
  const [userCounts, setUserCounts] = useState<AdminUserCounts | null>(null);
  const [stockStatus, setStockStatus] = useState<AdminProductStockStatus | null>(null);
  const [sellerCount, setSellerCount] = useState<AdminSellerTotalCount | null>(null);
  const [pendingProducts, setPendingProducts] = useState<AdminPendingProductCount | null>(null);
  const [pendingPayouts, setPendingPayouts] = useState<AdminPendingPayoutCount | null>(null);
  const [totalOrders, setTotalOrders] = useState<AdminTotalOrdersCount | null>(null);
  const [pendingOrders, setPendingOrders] = useState<AdminPendingOrdersCount | null>(null);
  const [latestSellers, setLatestSellers] = useState<AdminLatestSeller[]>([]);
  const [latestProducts, setLatestProducts] = useState<AdminLatestProduct[]>([]);
  const [searchTerms, setSearchTerms] = useState<AdminPopularSearchTerm[]>([]);
  const [errors, setErrors] = useState<AdminDashboardErrors>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        setIsRefreshing(true);
      }

      const nextErrors: AdminDashboardErrors = {};

      const requests: Array<Promise<void>> = [
        (async () => {
          if (!fullAccess) {
            setTotalSales(null);
            return;
          }

          try {
            setTotalSales(await getAdminTotalSales());
          } catch (err) {
            setTotalSales(null);
            nextErrors.totalSales = getErrorMessage(err, 'Failed to load sales summary');
          }
        })(),
        (async () => {
          try {
            setUserCounts(await getAdminUserCounts());
          } catch (err) {
            setUserCounts(null);
            nextErrors.userCounts = getErrorMessage(err, 'Failed to load user engagement');
          }
        })(),
        (async () => {
          try {
            setStockStatus(await getAdminProductStockStatus());
          } catch (err) {
            setStockStatus(null);
            nextErrors.stockStatus = getErrorMessage(err, 'Failed to load stock status');
          }
        })(),
        (async () => {
          try {
            setSellerCount(await getAdminSellerTotalCount());
          } catch (err) {
            setSellerCount(null);
            nextErrors.sellerCount = getErrorMessage(err, 'Failed to load seller count');
          }
        })(),
        (async () => {
          try {
            setPendingProducts(await getAdminPendingProductCount());
          } catch (err) {
            setPendingProducts(null);
            nextErrors.pendingProducts = getErrorMessage(err, 'Failed to load pending products');
          }
        })(),
        (async () => {
          try {
            setPendingPayouts(await getAdminPendingPayoutCount());
          } catch (err) {
            setPendingPayouts(null);
            nextErrors.pendingPayouts = getErrorMessage(err, 'Failed to load pending payouts');
          }
        })(),
        (async () => {
          try {
            setTotalOrders(await getAdminTotalOrdersCount());
          } catch (err) {
            setTotalOrders(null);
            nextErrors.totalOrders = getErrorMessage(err, 'Failed to load total orders');
          }
        })(),
        (async () => {
          try {
            setPendingOrders(await getAdminPendingOrdersCount());
          } catch (err) {
            setPendingOrders(null);
            nextErrors.pendingOrders = getErrorMessage(err, 'Failed to load pending orders');
          }
        })(),
        (async () => {
          try {
            const response = await getAdminLatestSellers();
            setLatestSellers(Array.isArray(response.data) ? response.data : []);
          } catch (err) {
            setLatestSellers([]);
            nextErrors.latestSellers = getErrorMessage(err, 'Failed to load latest sellers');
          }
        })(),
        (async () => {
          try {
            const response = await getAdminLatestProducts();
            setLatestProducts(Array.isArray(response.data) ? response.data : []);
          } catch (err) {
            setLatestProducts([]);
            nextErrors.latestProducts = getErrorMessage(err, 'Failed to load latest products');
          }
        })(),
        (async () => {
          try {
            setSearchTerms(await getAdminPopularSearchTerms());
          } catch (err) {
            setSearchTerms([]);
            nextErrors.searchTerms = getErrorMessage(err, 'Failed to load search terms');
          }
        })(),
      ];

      await Promise.all(requests);
      setErrors(nextErrors);
      setIsRefreshing(false);
    },
    [fullAccess],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    totalSales,
    userCounts,
    stockStatus,
    sellerCount,
    pendingProducts,
    pendingPayouts,
    totalOrders,
    pendingOrders,
    latestSellers,
    latestProducts,
    searchTerms,
    errors,
    isRefreshing,
    refresh: () => loadDashboard(true),
  };
}
