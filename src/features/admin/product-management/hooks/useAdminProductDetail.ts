import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError, getErrorMessage } from '../../../../services/api/errors';
import { getAdminProductById } from '../api/adminProductManagementApi';
import type { AdminProductDetail, AdminProductListItem } from '../types/adminProductManagement';
import { applyAdminProductSessionPatch, setAdminProductSessionPatch } from '../state/adminProductSessionPatch';
import { toAdminProductListPatch } from '../utils/adminProductOperations';

export function useAdminProductDetail(
  productId: string | undefined,
  initialProduct?: AdminProductListItem,
) {
  const [product, setProduct] = useState<AdminProductDetail | null>(
    applyAdminProductSessionPatch(initialProduct ?? null) ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(productId) && !initialProduct);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestVersionRef = useRef(0);
  const hasCachedProductRef = useRef(Boolean(initialProduct));

  useEffect(() => {
    hasCachedProductRef.current = Boolean(initialProduct);
    if (initialProduct) {
      setProduct(applyAdminProductSessionPatch(initialProduct) ?? initialProduct);
    } else {
      setProduct(null);
    }
    setError(null);
    setIsNotFound(false);
    setIsLoading(Boolean(productId) && !initialProduct);
  }, [initialProduct, productId]);

  const loadProduct = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!productId) {
        setProduct(null);
        setError(null);
        setIsNotFound(false);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedProductRef.current) {
        setIsLoading(true);
      }

      setError(null);
      setIsNotFound(false);

      try {
        const response = await getAdminProductById(productId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applyAdminProductSessionPatch(response) ?? response;
        setProduct(merged);
        hasCachedProductRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const notFound = err instanceof ApiError && err.statusCode === 404;
        setIsNotFound(notFound);

        if (!hasCachedProductRef.current) {
          setProduct(null);
        }

        setError(
          notFound ? 'Product not found.' : getErrorMessage(err, 'Failed to load product'),
        );
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [productId],
  );

  useEffect(() => {
    void loadProduct(hasCachedProductRef.current ? 'refresh' : 'initial');
  }, [loadProduct]);

  const refresh = useCallback(async () => {
    await loadProduct('refresh');
  }, [loadProduct]);

  const syncSessionPatch = useCallback(() => {
    setProduct((current) => applyAdminProductSessionPatch(current) ?? current);
  }, []);

  const applyProductUpdate = useCallback(
    (updatedProduct: AdminProductDetail) => {
      if (!productId) {
        return;
      }

      setAdminProductSessionPatch(productId, toAdminProductListPatch(updatedProduct));
      setProduct(updatedProduct);
    },
    [productId],
  );

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  return {
    product,
    isLoading,
    isRefreshing,
    error,
    isNotFound,
    refresh,
    syncSessionPatch,
    applyProductUpdate,
  };
}
