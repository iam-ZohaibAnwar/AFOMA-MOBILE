import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createProduct,
  getSellerProductById,
  updateProduct,
} from '../api/sellerProductsApi';
import {
  fetchCurrencyOptions,
  fetchCurrencyRateToCad,
  type CurrencyOption,
} from '../services/currencyRateService';
import {
  createEmptyCustomizableProductForm,
  type CustomizableProductFormValues,
} from '../types/customizableProductForm';
import { buildCustomizableProductPayload } from '../utils/customizableProductPayload';
import {
  CUSTOMIZABLE_WIZARD_STEPS,
  type CustomizableWizardStepId,
} from '../utils/productTypeConstants';
import {
  validateCustomizableProductForm,
  validateCustomizableProductStep,
} from '../utils/customizableProductValidation';
import {
  mapImagesFromProduct,
  mapProductToCustomizableForm,
  resolveEditProductStatus,
} from '../utils/productFormMappers';
import { useProductImages } from './useProductImages';

export function useCustomizableProductWizard(sellerId?: string, productId?: string) {
  const [values, setValues] = useState<CustomizableProductFormValues>(createEmptyCustomizableProductForm);
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
  const [savedProductId, setSavedProductId] = useState<string | null>(productId ?? null);
  const [productStatus, setProductStatus] = useState<string | undefined>();
  const [isLoadingProduct, setIsLoadingProduct] = useState(Boolean(productId));
  const [loadProductError, setLoadProductError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([
    { value: 'cad', label: 'CAD - Canadian Dollar' },
  ]);
  const [currencyRate, setCurrencyRate] = useState(1);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

  const isEditMode = Boolean(productId);
  const currentStep = CUSTOMIZABLE_WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === CUSTOMIZABLE_WIZARD_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

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
    if (!productId) {
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      setIsLoadingProduct(true);
      setLoadProductError(null);

      try {
        const product = await getSellerProductById(productId);
        if (cancelled) {
          return;
        }

        setValues(mapProductToCustomizableForm(product));
        setImagesFromEntries(mapImagesFromProduct(product));
        setProductStatus(product.productStatus);
        setSavedProductId(product._id ?? productId);
        if (product.currencyRate) {
          setCurrencyRate(product.currencyRate);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadProductError(getErrorMessage(err, 'Failed to load product'));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProduct(false);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId, setImagesFromEntries]);

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
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep.id, images, values]);

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

  const addImage = useCallback(async () => {
    setSaveError(null);
    await addImageFromPicker(values.productName.trim());
  }, [addImageFromPicker, values.productName]);

  const saveProduct = useCallback(async () => {
    if (!sellerId) {
      setSaveError('Seller ID unavailable. Sign in again and retry.');
      return null;
    }

    const errors = validateCustomizableProductForm(values, images);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const readyImages = await uploadPendingImages(images);
      const editId = savedProductId ?? productId;
      const payload = buildCustomizableProductPayload(
        values,
        readyImages,
        sellerId,
        currencyRate,
        editId ? resolveEditProductStatus(productStatus) : undefined,
      );

      const product = editId
        ? await updateProduct(editId, payload)
        : await createProduct(payload);
      const nextProductId = product._id;

      if (!nextProductId) {
        throw new Error('Product saved but no ID returned');
      }

      setSavedProductId(nextProductId);
      setProductStatus(product.productStatus ?? (editId ? resolveEditProductStatus(productStatus) : 'Draft'));
      setSaveSuccessMessage(editId ? 'Product updated.' : 'Base product saved. Continue to variations.');
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
    productStatus,
    savedProductId,
    sellerId,
    uploadPendingImages,
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
    productStatus,
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
    setSaveError,
  };
}
