import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  deleteAdminSeller,
  updateAdminSellerShopVisibility,
} from '../api/adminSellerManagementApi';
import { requestAdminSellerListRefresh } from '../state/adminSellerListRefresh';

export function useAdminSellerOperations() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingSellerId, setUpdatingSellerId] = useState<string | null>(null);
  const [deletingSellerId, setDeletingSellerId] = useState<string | null>(null);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const setShopVisibility = useCallback(async (sellerId: string, visible: boolean) => {
    setActionError(null);
    setUpdatingSellerId(sellerId);

    try {
      await updateAdminSellerShopVisibility(sellerId, visible ? 1 : 0);
      requestAdminSellerListRefresh();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to update shop visibility'));
      return false;
    } finally {
      setUpdatingSellerId(null);
    }
  }, []);

  const deleteSeller = useCallback(async (sellerId: string) => {
    setActionError(null);
    setDeletingSellerId(sellerId);

    try {
      await deleteAdminSeller(sellerId);
      requestAdminSellerListRefresh({ resetToFirstPage: true });
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete seller'));
      return false;
    } finally {
      setDeletingSellerId(null);
    }
  }, []);

  return {
    actionError,
    clearActionError,
    updatingSellerId,
    deletingSellerId,
    setShopVisibility,
    deleteSeller,
  };
}
