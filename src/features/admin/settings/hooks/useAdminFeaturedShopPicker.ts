import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getAdminSellerList } from '../../seller-management/api/adminSellerManagementApi';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';

const PICKER_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

interface UseAdminFeaturedShopPickerOptions {
  enabled: boolean;
}

export function useAdminFeaturedShopPicker({ enabled }: UseAdminFeaturedShopPickerOptions) {
  const [sellers, setSellers] = useState<AdminSellerListItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    if (!enabled) {
      setSellers([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    setIsLoading(true);

    try {
      const response = await getAdminSellerList({
        page: 1,
        limit: PICKER_PAGE_SIZE,
        search: searchTerm || undefined,
        status: 'Approved',
        shopStatus: 'Active',
      });

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setSellers(Array.isArray(response.sellers) ? response.sellers : []);
      setError(null);
    } catch (loadError) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setError(getErrorMessage(loadError, 'Failed to load sellers'));
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, searchTerm]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    sellers,
    searchInput,
    setSearchInput,
    isLoading,
    error,
    reload: load,
  };
}
