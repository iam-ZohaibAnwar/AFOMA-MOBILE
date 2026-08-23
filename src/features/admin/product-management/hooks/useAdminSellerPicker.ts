import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import type { SelectOption } from '../../../../utils/regionOptions';
import { getAdminSellerList } from '../../seller-management/api/adminSellerManagementApi';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';

function formatSellerPickerLabel(seller: AdminSellerListItem): string {
  const name = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  if (name) {
    return name;
  }

  return seller.storeTitle?.trim() || seller.email?.trim() || 'Seller';
}

export function useAdminSellerPicker(enabled: boolean) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadSellers = useCallback(async () => {
    if (!enabled) {
      setOptions([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdminSellerList({ page: 1, limit: 100 });
      const sellers = Array.isArray(response.sellers) ? response.sellers : [];
      const nextOptions = sellers
        .filter((seller) => seller._id && seller.userRole === 'seller')
        .map((seller) => ({
          label: formatSellerPickerLabel(seller),
          value: seller._id as string,
        }));

      setOptions(nextOptions);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load sellers'));
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  return {
    options,
    isLoading,
    error,
    reload: loadSellers,
  };
}
