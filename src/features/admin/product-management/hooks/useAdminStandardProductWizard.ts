import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createProduct,
  getSellerProductById,
  updateProduct,
} from '../../../seller/products/api/sellerProductsApi';
import {
  convertToCadPrice,
  fetchCurrencyOptions,
  fetchCurrencyRateToCad,
  type CurrencyOption,
} from '../../../seller/products/services/currencyRateService';
import {
  createEmptyStandardProductForm,
  type StandardProductFormValues,
} from '../../../seller/products/types/standardProductForm';
import {
  STANDARD_WIZARD_STEPS,
  type StandardWizardStepId,
} from '../../../seller/products/utils/standardProductConstants';
import {
  validateStandardProductForm,
  validateStandardProductStep,
} from '../../../seller/products/utils/standardProductValidation';
import {
  mapImagesFromProduct,
  mapProductToStandardForm,
} from '../../../seller/products/utils/productFormMappers';
import type { AdminProductListItem } from '../types/adminProductManagement';
import {
  hydrateAdminStandardWizardFromProduct,
  isAdminProductWizardCacheMatch,
} from '../utils/adminProductWizardCache';
import { useProductImages } from '../../../seller/products/hooks/useProductImages';
import { requestAdminProductListRefresh } from '../state/adminProductListRefresh';
import { setAdminProductSessionPatch } from '../state/adminProductSessionPatch';
import {
  buildAdminStandardProductPayload,
  resolveAdminProductSellerId,
} from '../utils/adminProductWritePayload';
import { toAdminProductListPatch } from '../utils/adminProductOperations';
import type { AdminProductAiPrefill } from '../types/adminProductAiPrefill';
import { useAdminProductAiPrefillEffect } from './useAdminProductAiPrefillEffect';

export function useAdminStandardProductWizard(
  sellerId?: string,
  productId?: string,
  initialProduct?: AdminProductListItem,
) {
  const cacheMatch = isAdminProductWizardCacheMatch(productId, initialProduct);
  const cachedProduct = cacheMatch ? hydrateAdminStandardWizardFromProduct(initialProduct) : null;

  const [values, setValues] = useState<StandardProductFormValues>(
    cachedProduct?.values ?? createEmptyStandardProductForm(),
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([
    { value: 'cad', label: 'CAD - Canadian Dollar' },
  ]);
  const [currencyRate, setCurrencyRate] = useState(cachedProduct?.currencyRate ?? 1);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

  const isEditMode = Boolean(productId);
  const currentStep = STANDARD_WIZARD_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STANDARD_WIZARD_STEPS.length - 1;

  const applyAiPrefill = useCallback(
    (prefill: AdminProductAiPrefill) => {
      if (prefill.standardValues) {
        setValues((current) => ({ ...current, ...prefill.standardValues! }));
      }
      if (prefill.images.length > 0) {
        setImagesFromEntries(prefill.images);
      }
    },
    [setImagesFromEntries],
  );

  useAdminProductAiPrefillEffect('Standard', productId, applyAiPrefill);

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

  useLayoutEffect(() => {
    if (cachedProduct?.images.length) {
      setImagesFromEntries(cachedProduct.images);
    }
  }, [cachedProduct?.images, setImagesFromEntries]);

  useEffect(() => {
    hasCachedProductRef.current = isAdminProductWizardCacheMatch(productId, initialProduct);
    if (hasCachedProductRef.current && initialProduct) {
      const hydrated = hydrateAdminStandardWizardFromProduct(initialProduct);
      setValues(hydrated.values);
      setImagesFromEntries(hydrated.images);
      setSavedProductId(hydrated.savedProductId);
      setResolvedSellerId(hydrated.resolvedSellerId);
      setCurrencyRate(hydrated.currencyRate);
      setLoadProductError(null);
      setIsLoadingProduct(false);
    } else if (productId) {
      setIsLoadingProduct(true);
    }
  }, [initialProduct, productId, setImagesFromEntries]);

  const applyProductToWizard = useCallback(
    (product: AdminProductListItem) => {
      const hydrated = hydrateAdminStandardWizardFromProduct(product);
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
    <K extends keyof StandardProductFormValues>(field: K, nextValue: StandardProductFormValues[K]) => {
      setValues((current) => {
        const next = { ...current, [field]: nextValue };

        if (field === 'currency') {
          next.currencyPrice = '';
          next.price = '';
        }

        if (field === 'currencyPrice' && typeof nextValue === 'string' && next.currency !== 'cad') {
          next.price = convertToCadPrice(nextValue, currencyRate);
        }

        return next;
      });

      setFieldErrors((current) => {
        if (!(field in current)) {
          return current;
        }

        const next = { ...current };
        delete next[field as string];
        return next;
      });
    },
    [currencyRate],
  );

  const validateCurrentStep = useCallback(() => {
    const errors = validateStandardProductStep(currentStep.id, values, images);
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

    setStepIndex((index) => Math.min(index + 1, STANDARD_WIZARD_STEPS.length - 1));
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToStep = useCallback((stepId: StandardWizardStepId) => {
    const index = STANDARD_WIZARD_STEPS.findIndex((step) => step.id === stepId);
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

    const errors = validateStandardProductForm(values, images);
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
      const uploadedImages = readyImages.filter((image) => image.imageUrl && image.fileName);

      if (uploadedImages.length < 3) {
        throw new Error('At least 3 uploaded images are required');
      }

      const editId = savedProductId ?? productId;
      const payload = buildAdminStandardProductPayload(
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
        editId ? 'Product updated.' : 'Product created with Pending approval.',
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
    productId,
    savedProductId,
    sellerId,
    uploadPendingImagesWithError,
    values,
    isSaving,
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
    isLoadingCurrencies,
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
