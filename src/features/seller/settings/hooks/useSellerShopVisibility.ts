import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { updateSellerShopStatus } from '../../../../services/api/sellersApi';
import { useSellerProfile } from '../../hooks/useSellerProfile';
import { isSellerShopVisible } from '../utils/shopVisibilityDisplay';

export function useSellerShopVisibility(sellerId?: string) {
  const { profile, isLoading, error, reload } = useSellerProfile(sellerId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isVisible = isSellerShopVisible(profile);

  const setShopVisibility = useCallback(
    async (visible: boolean) => {
      if (!sellerId) {
        return false;
      }

      setIsUpdating(true);
      setUpdateError(null);

      try {
        await updateSellerShopStatus(sellerId, visible ? 1 : 0);
        await reload();
        return true;
      } catch (err) {
        setUpdateError(getErrorMessage(err, 'Failed to update shop visibility'));
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [reload, sellerId],
  );

  const clearUpdateError = useCallback(() => {
    setUpdateError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    isUpdating,
    updateError,
    isVisible,
    setShopVisibility,
    reload,
    clearUpdateError,
  };
}
