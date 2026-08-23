import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  canSubmitProductForReview,
  createProduct,
  getSellerProductById,
  submitProductForReview,
  updateProduct,
} from '../api/sellerProductsApi';
import {
  convertToCadPrice,
  fetchCurrencyOptions,
  fetchCurrencyRateToCad,
  type CurrencyOption,
} from '../services/currencyRateService';
import {
  createEmptyStandardProductForm,
  type StandardProductFormValues,
} from '../types/standardProductForm';
import { buildStandardProductPayload } from '../utils/standardProductPayload';
import {
  STANDARD_WIZARD_STEPS,
  type StandardWizardStepId,
} from '../utils/standardProductConstants';
import {
  validateStandardProductForm,
  validateStandardProductStep,
} from '../utils/standardProductValidation';
import {
  mapImagesFromProduct,
  mapProductToStandardForm,
  resolveEditProductStatus,
} from '../utils/productFormMappers';
import { useProductImages } from './useProductImages';

export function useStandardProductWizard(sellerId?: string, productId?: string) {
  const [values, setValues] = useState<StandardProductFormValues>(createEmptyStandardProductForm);
  const {
    images,
    uploadedImageCount,
    imageError,
    setImageError,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [currencyOptions, setCurrencyOptions] = useState<CurrencyOption[]>([
    { value: 'cad', label: 'CAD - Canadian Dollar' },
  ]);
  const [currencyRate, setCurrencyRate] = useState(1);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);

  const isEditMode = Boolean(productId);
  const canSubmit = canSubmitProductForReview(productStatus);

  const currentStep = STANDARD_WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === STANDARD_WIZARD_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  useEffect(() => {
    let cancelled = false;

    const loadCurrencies = async () => {
      setIsLoadingCurrencies(true);
      try {
        const options = await fetchCurrencyOptions();
        if (!cancelled && options.length > 0) {
          setCurrencyOptions(options);
        }
      } catch {
        // Keep CAD default only.
      } finally {
        if (!cancelled) {
          setIsLoadingCurrencies(false);
        }
      }
    };

    void loadCurrencies();

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

        setValues(mapProductToStandardForm(product));
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
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep.id, images, values]);

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
    if (!sellerId) {
      setSaveError('Seller ID unavailable. Sign in again and retry.');
      return null;
    }

    const errors = validateStandardProductForm(values, images);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);
    setSubmitError(null);

    try {
      const readyImages = await uploadPendingImagesWithError();
      const uploadedImages = readyImages.filter((image) => image.imageUrl && image.fileName);

      if (uploadedImages.length < 3) {
        throw new Error('At least 3 uploaded images are required');
      }

      const payload = buildStandardProductPayload(values, readyImages, sellerId, currencyRate);
      const editId = savedProductId ?? productId;

      if (editId) {
        payload.productStatus = resolveEditProductStatus(productStatus);
      }

      const product = editId
        ? await updateProduct(editId, payload)
        : await createProduct(payload);
      const nextProductId = product._id;

      if (!nextProductId) {
        throw new Error('Product saved but no ID returned');
      }

      setSavedProductId(nextProductId);
      setProductStatus(product.productStatus ?? (editId ? resolveEditProductStatus(productStatus) : 'Draft'));
      setSaveSuccessMessage(editId ? 'Product updated.' : 'Product saved as draft.');
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
    uploadPendingImagesWithError,
    values,
  ]);

  const submitForReview = useCallback(async () => {
    const targetId = savedProductId ?? productId;
    if (!targetId) {
      setSubmitError('Save the product before submitting for approval.');
      return false;
    }

    if (!canSubmitProductForReview(productStatus)) {
      setSubmitError('This product cannot be submitted for review in its current status.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitProductForReview(targetId);
      setProductStatus('Review');
      setSaveSuccessMessage('Product submitted for approval.');
      return true;
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to submit product for review'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, productStatus, savedProductId]);

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
    isSubmitting,
    canSubmit,
    saveError: saveError ?? imageError,
    submitError,
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
    submitForReview,
    setSaveError,
    setSubmitError,
  };
}
