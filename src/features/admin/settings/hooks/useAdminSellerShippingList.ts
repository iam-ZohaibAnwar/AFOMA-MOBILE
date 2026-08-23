import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import { getAdminSellerList } from '../../seller-management/api/adminSellerManagementApi';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';

const SELLER_FETCH_LIMIT = 500;

export function useAdminSellerShippingList(enabled: boolean) {
  const [sellers, setSellers] = useState<AdminSellerListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;

      if (mode === 'initial' && sellers.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await getAdminSellerList({ page: 1, limit: SELLER_FETCH_LIMIT });
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const roleFiltered = response.sellers.filter((seller) => seller.userRole === 'seller');
        setSellers(roleFiltered);
        setError(null);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!sellers.length) {
          setError(getErrorMessage(loadError, 'Failed to load sellers'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled, sellers.length],
  );

  useEffect(() => {
    void load('initial');
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when enabled toggles

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }

      void load('refresh');
    }, [enabled, load]),
  );

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const filteredSellers = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) {
      return sellers;
    }

    return sellers.filter((seller) => `${seller.firstName ?? ''}`.toLowerCase().includes(query));
  }, [searchInput, sellers]);

  return {
    sellers: filteredSellers,
    searchInput,
    setSearchInput,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
