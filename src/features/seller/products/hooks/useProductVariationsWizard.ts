import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ProductVariation } from '../../../../services/types/product';
import { getErrorMessage } from '../../../../services/api/errors';
import {
  canSubmitProductForReview,
  getSellerGlobalAttributes,
  getSellerProductById,
  submitProductForReview,
  updateProductVariations,
} from '../api/sellerProductsApi';
import {
  createEmptyVariationRow,
  type VariationRow,
} from '../types/customizableProductForm';
import { validateVariationRows } from '../utils/customizableProductValidation';
import {
  planAttributeToggle,
  reshapeVariationRowsForAttributes,
  VARIATION_META_KEYS,
  type AttributeTogglePlan,
} from '../utils/variationAttributes';

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

export function useProductVariationsWizard(sellerId?: string, productId?: string) {
  const [productName, setProductName] = useState('');
  const [productStatus, setProductStatus] = useState<string | undefined>();
  const [productCurrency, setProductCurrency] = useState('cad');
  const [productImages, setProductImages] = useState<Array<{ imageUrl?: string; altText?: string }>>(
    [],
  );
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [rows, setRows] = useState<VariationRow[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
  const canSubmit = canSubmitProductForReview(productStatus);

  useEffect(() => {
    if (!productId || !sellerId) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [product, attributes] = await Promise.all([
          getSellerProductById(productId),
          getSellerGlobalAttributes(sellerId),
        ]);

        if (cancelled) {
          return;
        }

        setProductName(product.productName ?? '');
        setProductStatus(product.productStatus);
        setProductCurrency(product.currency ?? 'cad');
        setProductImages(product.images ?? []);
        setAvailableAttributes(attributes);

        const existingVariations = product.variations ?? [];
        const inferredAttributes = inferAttributesFromVariations(existingVariations);
        setSelectedAttributes(inferredAttributes);
        setRows(mapVariationsToRows(existingVariations, inferredAttributes));
      } catch (err) {
        if (!cancelled) {
          setLoadError(getErrorMessage(err, 'Failed to load product variations'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [productId, sellerId]);

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
    setSubmitError(null);

    try {
      await updateProductVariations(productId, mapRowsToPayload(rows, selectedAttributes));
      setSaveSuccessMessage('Variations saved.');
      return true;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save variations'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [hasCurrency, hasImages, productId, rows, selectedAttributes]);

  const submitForReview = useCallback(async () => {
    if (!productId) {
      setSubmitError('Product ID unavailable.');
      return false;
    }

    if (!canSubmitProductForReview(productStatus)) {
      setSubmitError('This product cannot be submitted for review in its current status.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitProductForReview(productId);
      setProductStatus('Review');
      setSaveSuccessMessage('Product submitted for approval.');
      return true;
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to submit product for review'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, productStatus]);

  const refreshAttributes = useCallback(async () => {
    if (!sellerId) {
      return;
    }

    try {
      const attributes = await getSellerGlobalAttributes(sellerId);
      setAvailableAttributes(attributes);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to refresh attributes'));
    }
  }, [sellerId]);

  return {
    productName,
    productStatus,
    availableAttributes,
    selectedAttributes,
    rows,
    rowErrors,
    imageOptions,
    hasCurrency,
    isLoading,
    loadError,
    isSaving,
    isSubmitting,
    canSubmit,
    saveError,
    submitError,
    saveSuccessMessage,
    planToggleAttribute,
    applyAttributeSelection,
    addRow,
    removeRow,
    updateRowField,
    saveVariations,
    submitForReview,
    refreshAttributes,
    setSaveError,
    setSubmitError,
  };
}
