import { useCallback, useEffect, useState } from 'react';

import { getProductById, getProductBySlug } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import type { Product } from '../../../services/types/product';

async function fetchProduct(productId?: string, slug?: string): Promise<Product> {
  if (productId) {
    try {
      return await getProductById(productId);
    } catch (primaryError) {
      if (slug) {
        return getProductBySlug(slug);
      }
      throw primaryError;
    }
  }

  if (slug) {
    return getProductBySlug(slug);
  }

  throw new Error('Product not found');
}

export function useProductDetail(productId?: string, slug?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId && !slug) {
      setProduct(null);
      setError('Product not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchProduct(productId, slug);
      setProduct(data);
    } catch (err) {
      setProduct(null);
      setError(getErrorMessage(err, 'Failed to load product'));
    } finally {
      setIsLoading(false);
    }
  }, [productId, slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  return {
    product,
    isLoading,
    error,
    retry: loadProduct,
  };
}
