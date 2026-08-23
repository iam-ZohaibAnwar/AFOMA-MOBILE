import { useCallback, useState } from 'react';

import type { Product } from '../../../../services/types/product';
import { getErrorMessage } from '../../../../services/api/errors';
import { createProduct } from '../../../seller/products/api/sellerProductsApi';
import { getAdminProductById } from '../api/adminProductManagementApi';
import { requestAdminProductListRefresh } from '../state/adminProductListRefresh';
import type { AdminProductDetail } from '../types/adminProductManagement';
import {
  buildAdminDuplicateProductPayload,
  getAdminDuplicateValidationMessage,
  validateAdminProductDuplicatable,
} from '../utils/adminProductDuplicatePayload';

export function useAdminDuplicateProduct() {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const clearDuplicateError = useCallback(() => {
    setDuplicateError(null);
  }, []);

  const duplicateProduct = useCallback(
    async (source: AdminProductDetail): Promise<Product | null> => {
      if (isDuplicating) {
        return null;
      }

      const validation = validateAdminProductDuplicatable(source);
      if (!validation.canDuplicate) {
        setDuplicateError(getAdminDuplicateValidationMessage(validation));
        return null;
      }

      setIsDuplicating(true);
      setDuplicateError(null);

      try {
        const fullSource = source._id ? await getAdminProductById(source._id) : source;
        const payload = buildAdminDuplicateProductPayload(fullSource);

        if (!payload) {
          setDuplicateError('Unable to build duplicate payload. Check seller and categories.');
          return null;
        }

        const newProduct = await createProduct(payload);
        requestAdminProductListRefresh({ resetToFirstPage: true });
        return newProduct;
      } catch (err) {
        setDuplicateError(getErrorMessage(err, 'Failed to duplicate product'));
        return null;
      } finally {
        setIsDuplicating(false);
      }
    },
    [isDuplicating],
  );

  return {
    isDuplicating,
    duplicateError,
    clearDuplicateError,
    duplicateProduct,
  };
}
