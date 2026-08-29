import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createProduct,
  getSellerProductById,
  updateProduct,
} from '../../../seller/products/api/sellerProductsApi';
import {
  fetchCurrencyOptions,
  fetchCurrencyRateToCad,
  type CurrencyOption,
} from '../../../seller/products/services/currencyRateService';
import {
  createEmptyCustomizableProductForm,
  type CustomizableProductFormValues,
} from '../../../seller/products/types/customizableProductForm';
import {
  CUSTOMIZABLE_WIZARD_STEPS,
  type CustomizableWizardStepId,
} from '../../../seller/products/utils/productTypeConstants';
import {
  validateCustomizableProductForm,
  validateCustomizableProductStep,
} from '../../../seller/products/utils/customizableProductValidation';
import { useProductImages } from '../../../seller/products/hooks/useProductImages';
import { requestAdminProductListRefresh } from '../state/adminProductListRefresh';
import { setAdminProductSessionPatch } from '../state/adminProductSessionPatch';
import type { AdminProductListItem } from '../types/adminProductManagement';
import type { AdminProductAiPrefill } from '../types/adminProductAiPrefill';
import { toAdminProductListPatch } from '../utils/adminProductOperations';
import {
  buildAdminCustomizableProductPayload,
  resolveAdminProductSellerId,
} from '../utils/adminProductWritePayload';
import {
  hydrateAdminCustomizableWizardFromProduct,
  isAdminProductWizardCacheMatch,
} from '../utils/adminProductWizardCache';
import { useAdminProductAiPrefillEffect } from './useAdminProductAiPrefillEffect';

export function useAdminCustomizableProductWizard(
  sellerId?: string,
  productId?: string,
  initialProduct?: AdminProductListItem,
) {
  const cacheMatch = isAdminProductWizardCacheMatch(productId, initialProduct);
  const cachedProduct = cacheMatch ? hydrateAdminCustomizableWizardFromProduct(initialProduct) : null;

  const [values, setValues] = useState<CustomizableProductFormValues>(
    cachedProduct?.values ?? createEmptyCustomizableProductForm(),
  );
  const {
    images,
    uploadedImageCount,
    imageError,
    setImagesFromEntries,
    uploadPendingImages,
    addImageFromPicker,
    removeImage,
    moveImage,
    updateImageAltText,
  } = useProductImages();
  const [stepIndex, setStepIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedProductId, setSavedProductId] = useState<string | null>(
    cachedProduct?.savedProductId ?? productId ?? null,
  );
  const [resolvedSellerId, setResolvedSellerId] = useState<string | undefined>(
    cachedProduct?.resolvedSellerId,
  );
  const [isLoadingProduct, setIsLoadingProduct] = useState(Boolean(productId) && !cacheMatch);
  const [loadProductError, setLoadProductError] = useState<string | null>(null);
  const hasCachedProductRef = useRef(cacheMatch);
  const hydratedFromCacheIdRef = useRef<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([
    { value: 'cad', label: 'CAD - Canadian Dollar' },
  ]);
  const [currencyRate, setCurrencyRate] = useState(cachedProduct?.currencyRate ?? 1);

  const isEditMode = Boolean(productId);
  const currentStep = CUSTOMIZABLE_WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === CUSTOMIZABLE_WIZARD_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const applyAiPrefill = useCallback(
    (prefill: AdminProductAiPrefill) => {
      if (prefill.customizableValues) {
        setValues((current) => ({ ...current, ...prefill.customizableValues! }));
      }
      if (prefill.images.length > 0) {
        setImagesFromEntries(prefill.images);
      }
    },
    [setImagesFromEntries],
  );

  useAdminProductAiPrefillEffect('Customizable', productId, applyAiPrefill);

  useEffect(() => {
    let cancelled = false;
    void fetchCurrencyOptions()
      .then((options) => {
        if (!cancelled && options.length > 0) {
          setCurrencyOptions(options);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cacheMatchNow = isAdminProductWizardCacheMatch(productId, initialProduct);
    hasCachedProductRef.current = cacheMatchNow;

    if (cacheMatchNow && initialProduct && productId && hydratedFromCacheIdRef.current !== productId) {
      hydratedFromCacheIdRef.current = productId;
      const hydrated = hydrateAdminCustomizableWizardFromProduct(initialProduct);
      setValues(hydrated.values);
      setImagesFromEntries(hydrated.images);
      setSavedProductId(hydrated.savedProductId);
      setResolvedSellerId(hydrated.resolvedSellerId);
      setCurrencyRate(hydrated.currencyRate);
      setLoadProductError(null);
      setIsLoadingProduct(false);
      return;
    }

    if (productId && !cacheMatchNow) {
      hydratedFromCacheIdRef.current = null;
      setIsLoadingProduct(true);
    }
  }, [initialProduct?._id, productId, setImagesFromEntries]);

  const applyProductToWizard = useCallback(
    (product: AdminProductListItem) => {
      const hydrated = hydrateAdminCustomizableWizardFromProduct(product);
      setValues(hydrated.values);
      setImagesFromEntries(hydrated.images);
      setSavedProductId(hydrated.savedProductId);
      setResolvedSellerId(hydrated.resolvedSellerId);
      setCurrencyRate(hydrated.currencyRate);
      hasCachedProductRef.current = true;
    },
    [setImagesFromEntries],
  );

  const loadProduct = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!productId) {
        return;
      }

      if (mode === 'initial' && !hasCachedProductRef.current) {
        setIsLoadingProduct(true);
      }

      setLoadProductError(null);

      try {
        const product = await getSellerProductById(productId);
        applyProductToWizard(product);
      } catch (err) {
        if (!hasCachedProductRef.current) {
          setLoadProductError(getErrorMessage(err, 'Failed to load product'));
        }
      } finally {
        setIsLoadingProduct(false);
      }
    },
    [applyProductToWizard, productId],
  );

  useEffect(() => {
    if (!productId) {
      return;
    }

    void loadProduct(hasCachedProductRef.current ? 'refresh' : 'initial');
  }, [loadProduct, productId]);

  useEffect(() => {
    let cancelled = false;

    const syncRate = async () => {
      if (!values.currency || values.currency === 'cad') {
        setCurrencyRate(1);
        return;
      }

      const rate = await fetchCurrencyRateToCad(values.currency);
      if (!cancelled) {
        setCurrencyRate(rate ?? 1);
      }
    };

    void syncRate();

    return () => {
      cancelled = true;
    };
  }, [values.currency]);

  const updateField = useCallback(
    <K extends keyof CustomizableProductFormValues>(
      field: K,
      nextValue: CustomizableProductFormValues[K],
    ) => {
      setValues((current) => ({ ...current, [field]: nextValue }));

      setFieldErrors((current) => {
        if (!(field in current)) {
          return current;
        }

        const next = { ...current };
        delete next[field as string];
        return next;
      });
    },
    [],
  );

  const validateCurrentStep = useCallback(() => {
    const errors = validateCustomizableProductStep(currentStep.id, values, images);
    if (currentStep.id === 'basic' && !sellerId?.trim()) {
      errors.sellerId = 'Select a seller';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep.id, images, sellerId, values]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    setStepIndex((index) => Math.min(index + 1, CUSTOMIZABLE_WIZARD_STEPS.length - 1));
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToStep = useCallback((stepId: CustomizableWizardStepId) => {
    const index = CUSTOMIZABLE_WIZARD_STEPS.findIndex((step) => step.id === stepId);
    if (index >= 0) {
      setStepIndex(index);
    }
  }, []);

  const uploadPendingImagesWithError = useCallback(async () => {
    try {
      return await uploadPendingImages(images);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to upload images'));
      throw err;
    }
  }, [images, uploadPendingImages]);

  const addImage = useCallback(async () => {
    setSaveError(null);
    await addImageFromPicker(values.productName.trim());
  }, [addImageFromPicker, values.productName]);

  const saveProduct = useCallback(async () => {
    if (isSaving) {
      return null;
    }

    if (!sellerId?.trim()) {
      setSaveError('Select a seller before saving.');
      setFieldErrors((current) => ({ ...current, sellerId: 'Select a seller' }));
      return null;
    }

    const errors = validateCustomizableProductForm(values, images);
    if (!sellerId.trim()) {
      errors.sellerId = 'Select a seller';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const readyImages = await uploadPendingImagesWithError();
      const editId = savedProductId ?? productId;
      const payload = buildAdminCustomizableProductPayload(
        values,
        readyImages,
        sellerId.trim(),
        currencyRate,
        !editId,
      );

      const product = editId
        ? await updateProduct(editId, payload)
        : await createProduct(payload);
      const nextProductId = product._id;

      if (!nextProductId) {
        throw new Error('Product saved but no ID returned');
      }

      setSavedProductId(nextProductId);
      setAdminProductSessionPatch(nextProductId, toAdminProductListPatch(product));
      requestAdminProductListRefresh({ resetToFirstPage: !editId });
      setSaveSuccessMessage(
        editId ? 'Base product updated.' : 'Base product saved. Continue to variations.',
      );
      return nextProductId;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save product'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [
    currencyRate,
    images,
    isSaving,
    productId,
    savedProductId,
    sellerId,
    uploadPendingImagesWithError,
    values,
  ]);

  return {
    values,
    images,
    uploadedImageCount,
    stepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    fieldErrors,
    savedProductId,
    resolvedSellerId,
    isEditMode,
    isLoadingProduct,
    loadProductError,
    isSaving,
    saveError: saveError ?? imageError,
    saveSuccessMessage,
    currencyOptions,
    currencyRate,
    updateField,
    goNext,
    goBack,
    goToStep,
    addImageFromPicker: addImage,
    removeImage,
    moveImage,
    updateImageAltText,
    saveProduct,
    reloadProduct: () => loadProduct('initial'),
    setSaveError,
  };
}
