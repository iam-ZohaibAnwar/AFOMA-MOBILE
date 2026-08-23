import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  deleteAdminProduct,
  getAdminProductById,
  updateAdminProductApprovalStatus,
  updateAdminProductsStoreVisibility,
} from '../api/adminProductManagementApi';
import type { AdminProductDetail } from '../types/adminProductManagement';
import type { AdminProductApprovalStatus } from '../types/adminProductOperations';
import { requestAdminProductListRefresh } from '../state/adminProductListRefresh';
import {
  clearAdminProductSessionPatch,
  setAdminProductSessionPatch,
} from '../state/adminProductSessionPatch';
import {
  patchAdminProductApproval,
  patchAdminProductStoreVisibility,
  toAdminProductListPatch,
} from '../utils/adminProductOperations';

export function useAdminProductOperations(
  productId: string | undefined,
  onProductUpdated: (product: AdminProductDetail) => void,
) {
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const clearOperationError = useCallback(() => {
    setOperationError(null);
  }, []);

  const commitProductUpdate = useCallback(
    (updatedProduct: AdminProductDetail) => {
      if (!productId) {
        return;
      }

      setAdminProductSessionPatch(productId, toAdminProductListPatch(updatedProduct));
      onProductUpdated(updatedProduct);
    },
    [onProductUpdated, productId],
  );

  const refreshProductFromServer = useCallback(async (): Promise<AdminProductDetail | null> => {
    if (!productId) {
      return null;
    }

    try {
      const refreshed = await getAdminProductById(productId);
      commitProductUpdate(refreshed);
      return refreshed;
    } catch {
      return null;
    }
  }, [commitProductUpdate, productId]);

  const changeApprovalStatus = useCallback(
    async (product: AdminProductDetail, productStatus: AdminProductApprovalStatus | string) => {
      if (!productId || !product._id || product.productStatus === productStatus) {
        return false;
      }

      setIsUpdatingApproval(true);
      setOperationError(null);

      try {
        await updateAdminProductApprovalStatus(productId, productStatus);
        const patched = patchAdminProductApproval(product, productStatus);
        commitProductUpdate(patched);
        requestAdminProductListRefresh();
        void refreshProductFromServer();
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to update approval status'));
        return false;
      } finally {
        setIsUpdatingApproval(false);
      }
    },
    [commitProductUpdate, productId, refreshProductFromServer],
  );

  const setStoreVisibility = useCallback(
    async (product: AdminProductDetail, nextStatus: 0 | 1) => {
      if (!productId || !product._id || product.status === nextStatus) {
        return false;
      }

      setIsUpdatingVisibility(true);
      setOperationError(null);

      try {
        await updateAdminProductsStoreVisibility([productId], nextStatus);
        const patched = patchAdminProductStoreVisibility(product, nextStatus);
        commitProductUpdate(patched);
        requestAdminProductListRefresh();
        void refreshProductFromServer();
        return true;
      } catch (err) {
        setOperationError(getErrorMessage(err, 'Failed to update store visibility'));
        return false;
      } finally {
        setIsUpdatingVisibility(false);
      }
    },
    [commitProductUpdate, productId, refreshProductFromServer],
  );

  const deleteProduct = useCallback(async () => {
    if (!productId) {
      return false;
    }

    setIsDeleting(true);
    setOperationError(null);

    try {
      await deleteAdminProduct(productId);
      clearAdminProductSessionPatch(productId);
      requestAdminProductListRefresh();
      return true;
    } catch (err) {
      setOperationError(getErrorMessage(err, 'Failed to delete product'));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [productId]);

  return {
    isUpdatingApproval,
    isUpdatingVisibility,
    isDeleting,
    operationError,
    clearOperationError,
    changeApprovalStatus,
    setStoreVisibility,
    deleteProduct,
  };
}
