import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getSellersByIds } from '../../../services/api/sellersApi';
import { extractFeaturedShopIds, getAllSettingsTypes } from '../../../services/api/settingsApi';
import type { Seller } from '../../../services/types/seller';

const HOME_SELLER_LIMIT = 3;

export function useFeaturedSellers(limit = HOME_SELLER_LIMIT) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeaturedSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const settings = await getAllSettingsTypes();
      const shopIds = extractFeaturedShopIds(settings.settings);
      if (shopIds.length === 0) {
        setSellers([]);
        return;
      }

      const response = await getSellersByIds({ ids: shopIds });
      const list = Array.isArray(response) ? response : [];
      setSellers(list.slice(0, limit));
    } catch (err) {
      setSellers([]);
      setError(getErrorMessage(err, 'Failed to load featured sellers'));
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadFeaturedSellers();
  }, [loadFeaturedSellers]);

  return {
    sellers,
    isLoading,
    error,
    retry: loadFeaturedSellers,
  };
}
