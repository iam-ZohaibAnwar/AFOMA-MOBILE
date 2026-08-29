import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ProductVariation } from '../../../../services/types/product';
import { getErrorMessage } from '../../../../services/api/errors';
import {
  getSellerGlobalAttributes,
  getSellerProductById,
  updateProductVariations,
} from '../../../seller/products/api/sellerProductsApi';
import {
  createEmptyVariationRow,
  type VariationRow,
} from '../../../seller/products/types/customizableProductForm';
import { validateVariationRows } from '../../../seller/products/utils/customizableProductValidation';
import {
  planAttributeToggle,
  reshapeVariationRowsForAttributes,
  VARIATION_META_KEYS,
  type AttributeTogglePlan,
} from '../../../seller/products/utils/variationAttributes';
import { requestAdminProductListRefresh } from '../state/adminProductListRefresh';
import { setAdminProductSessionPatch } from '../state/adminProductSessionPatch';
import { resolveAdminProductSellerId } from '../utils/adminProductWritePayload';
import { toAdminProductListPatch } from '../utils/adminProductOperations';

function mapVariationsToRows(
  variations: ProductVariation[],
  attributeNames: string[],
): VariationRow[] {
  return variations.map((variation, index) => {
    const row = createEmptyVariationRow(attributeNames);
    row.id = `variation-loaded-${index}`;

    attributeNames.forEach((attribute) => {
      row[attribute] = String(variation[attribute] ?? '');
    });

    row.inventory = String(variation.inventory ?? '');
    row.quantity = variation.quantity != null ? String(variation.quantity) : '';
    row.price = variation.price != null ? String(variation.price) : '';
    row.currencyPrice =
      variation.currencyPrice != null ? String(variation.currencyPrice) : '';
    row.image =
      typeof variation.image === 'string'
        ? variation.image
        : variation.image?.imageUrl ?? '';

    return row;
  });
}

function mapRowsToPayload(rows: VariationRow[], attributeNames: string[]): ProductVariation[] {
  return rows.map((row) => {
    const payload: ProductVariation = {
      inventory: row.inventory,
      quantity: row.quantity ? Number(row.quantity) : undefined,
      price: row.price ? Number(row.price) : undefined,
      currencyPrice: row.currencyPrice ? Number(row.currencyPrice) : undefined,
      image: row.image,
    };

    attributeNames.forEach((attribute) => {
      payload[attribute] = row[attribute];
    });

    return payload;
  });
}

function inferAttributesFromVariations(variations: ProductVariation[]): string[] {
  if (!variations.length) {
    return [];
  }

  return Object.keys(variations[0]).filter((key) => !VARIATION_META_KEYS.has(key));
}

export type AdminProductVariationsInitialContext = {
  productName?: string;
  images?: Array<{ imageUrl?: string; altText?: string }>;
};

export function useAdminProductVariationsWizard(
  sellerId?: string,
  productId?: string,
  initialContext?: AdminProductVariationsInitialContext,
) {
  const hasCachedContextRef = useRef(
    Boolean(initialContext?.productName?.trim() || initialContext?.images?.length),
  );
  const [productName, setProductName] = useState(initialContext?.productName ?? '');
  const [productCurrency, setProductCurrency] = useState('cad');
  const [productImages, setProductImages] = useState<Array<{ imageUrl?: string; altText?: string }>>(
    initialContext?.images ?? [],
  );
  const [resolvedSellerId, setResolvedSellerId] = useState<string | undefined>(sellerId);
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [rows, setRows] = useState<VariationRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isHydrated, setIsHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const imageOptions = useMemo(
    () =>
      productImages
        .filter((image) => image.imageUrl)
        .map((image) => ({
          label: image.altText?.trim() || 'Product image',
          value: image.imageUrl!,
        })),
    [productImages],
  );

  const hasCurrency = productCurrency !== 'cad';
  const hasImages = imageOptions.length > 0;
  const effectiveSellerId = resolvedSellerId ?? sellerId;

  useEffect(() => {
    hasCachedContextRef.current = Boolean(
      initialContext?.productName?.trim() || initialContext?.images?.length,
    );
    if (initialContext?.productName) {
      setProductName(initialContext.productName);
    }
    if (initialContext?.images?.length) {
      setProductImages(initialContext.images);
    }
  }, [initialContext?.images, initialContext?.productName]);

  const applyProductToWizard = useCallback(
    async (product: Awaited<ReturnType<typeof getSellerProductById>>) => {
      const nextSellerId = resolveAdminProductSellerId(product.seller) || sellerId?.trim();
      if (!nextSellerId) {
        throw new Error('Seller ID unavailable for this product.');
      }

      setResolvedSellerId(nextSellerId);
      setProductName(product.productName ?? '');
      setProductCurrency(product.currency ?? 'cad');
      setProductImages(product.images ?? []);

      const attributes = await getSellerGlobalAttributes(nextSellerId);
      setAvailableAttributes(attributes);

      const existingVariations = product.variations ?? [];
      const inferredAttributes = inferAttributesFromVariations(existingVariations);
      setSelectedAttributes(inferredAttributes);
      setRows(mapVariationsToRows(existingVariations, inferredAttributes));
      hasCachedContextRef.current = true;
      setIsHydrated(true);
    },
    [sellerId],
  );

  const loadVariations = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!productId) {
        return;
      }

      if (mode === 'initial' && !hasCachedContextRef.current) {
        setIsLoading(true);
      }

      setLoadError(null);
      setIsHydrated(false);

      try {
        const product = await getSellerProductById(productId);
        await applyProductToWizard(product);
      } catch (err) {
        if (!hasCachedContextRef.current) {
          setLoadError(getErrorMessage(err, 'Failed to load product variations'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [applyProductToWizard, productId],
  );

  useEffect(() => {
    if (!productId) {
      return;
    }

    void loadVariations(hasCachedContextRef.current ? 'refresh' : 'initial');
  }, [loadVariations, productId]);

  const planToggleAttribute = useCallback(
    (attribute: string): AttributeTogglePlan =>
      planAttributeToggle(attribute, selectedAttributes, rows),
    [rows, selectedAttributes],
  );

  const applyAttributeSelection = useCallback((nextSelectedAttributes: string[]) => {
    setSelectedAttributes(nextSelectedAttributes);
    setRows((current) => reshapeVariationRowsForAttributes(current, nextSelectedAttributes));
    setRowErrors({});
    setSaveError(null);
  }, []);

  const addRow = useCallback(() => {
    if (!selectedAttributes.length) {
      setSaveError('Select at least one attribute before adding a variation row.');
      return;
    }

    setRows((current) => [...current, createEmptyVariationRow(selectedAttributes)]);
    setSaveError(null);
  }, [selectedAttributes]);

  const removeRow = useCallback((rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setRowErrors({});
  }, []);

  const updateRowField = useCallback((rowId: string, field: string, value: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const next = { ...row, [field]: value };
        if (field === 'inventory' && value === 'Out of Stock') {
          next.quantity = '';
        }

        return next;
      }),
    );
  }, []);

  const saveVariations = useCallback(async () => {
    if (isSaving) {
      return false;
    }

    if (!productId) {
      setSaveError('Product ID unavailable.');
      return false;
    }

    if (!selectedAttributes.length) {
      setSaveError('Select at least one attribute.');
      return false;
    }

    if (!rows.length) {
      setSaveError('Add at least one variation row.');
      return false;
    }

    const errors = validateVariationRows(rows, selectedAttributes, hasCurrency, hasImages);
    setRowErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the highlighted variation fields.');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const product = await updateProductVariations(
        productId,
        mapRowsToPayload(rows, selectedAttributes),
      );
      setAdminProductSessionPatch(productId, toAdminProductListPatch(product));
      requestAdminProductListRefresh();
      setSaveSuccessMessage('Variations saved.');
      return true;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save variations'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [hasCurrency, hasImages, isSaving, productId, rows, selectedAttributes]);

  const refreshAttributes = useCallback(async () => {
    if (!effectiveSellerId) {
      return;
    }

    try {
      const attributes = await getSellerGlobalAttributes(effectiveSellerId);
      setAvailableAttributes(attributes);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to refresh attributes'));
    }
  }, [effectiveSellerId]);

  return {
    productName,
    availableAttributes,
    selectedAttributes,
    rows,
    rowErrors,
    imageOptions,
    hasCurrency,
    resolvedSellerId: effectiveSellerId,
    isLoading,
    isHydrated,
    loadError,
    isSaving,
    saveError,
    saveSuccessMessage,
    planToggleAttribute,
    applyAttributeSelection,
    addRow,
    removeRow,
    updateRowField,
    saveVariations,
    reloadVariations: () => loadVariations('initial'),
    refreshAttributes,
    setSaveError,
  };
}
