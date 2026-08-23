import { useCallback, useEffect, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  canSubmitProductForReview,
  createProduct,
  getSellerProductById,
  submitProductForReview,
  updateProduct,
  uploadDownloadableFile,
} from '../api/sellerProductsApi';
import {
  convertToCadPrice,
  fetchCurrencyOptions,
  fetchCurrencyRateToCad,
  type CurrencyOption,
} from '../services/currencyRateService';
import {
  createEmptyDownloadableProductForm,
  type DownloadableFileEntry,
  type DownloadableProductFormValues,
} from '../types/downloadableProductForm';
import { buildDownloadableProductPayload } from '../utils/downloadableProductPayload';
import {
  DOWNLOADABLE_WIZARD_STEPS,
  type DownloadableWizardStepId,
} from '../utils/productTypeConstants';
import {
  validateDownloadableProductForm,
  validateDownloadableProductStep,
} from '../utils/downloadableProductValidation';
import {
  mapDownloadFileFromProduct,
  mapImagesFromProduct,
  mapProductToDownloadableForm,
  resolveEditProductStatus,
} from '../utils/productFormMappers';
import { useProductImages } from './useProductImages';

export function useDownloadableProductWizard(sellerId?: string, productId?: string) {
  const [values, setValues] = useState<DownloadableProductFormValues>(createEmptyDownloadableProductForm);
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
  const [downloadFile, setDownloadFile] = useState<DownloadableFileEntry | null>(null);
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
  const currentStep = DOWNLOADABLE_WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === DOWNLOADABLE_WIZARD_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;
  const hasDownloadFile = Boolean(
    downloadFile?.featuredProduct && downloadFile?.featuredProductUrl,
  );

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

        setValues(mapProductToDownloadableForm(product));
        setImagesFromEntries(mapImagesFromProduct(product));
        setDownloadFile(mapDownloadFileFromProduct(product));
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
    <K extends keyof DownloadableProductFormValues>(
      field: K,
      nextValue: DownloadableProductFormValues[K],
    ) => {
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
    const errors = validateDownloadableProductStep(currentStep.id, values, images, hasDownloadFile);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep.id, hasDownloadFile, images, values]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) {
      return false;
    }

    setStepIndex((index) => Math.min(index + 1, DOWNLOADABLE_WIZARD_STEPS.length - 1));
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToStep = useCallback((stepId: DownloadableWizardStepId) => {
    const index = DOWNLOADABLE_WIZARD_STEPS.findIndex((step) => step.id === stepId);
    if (index >= 0) {
      setStepIndex(index);
    }
  }, []);

  const pickDownloadFile = useCallback(async () => {
    setSaveError(null);

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    const asset = result.assets[0];
    setDownloadFile({
      featuredProduct: '',
      featuredProductUrl: '',
      localUri: asset.uri,
      fileName: asset.name,
      isUploading: true,
    });

    try {
      const uploaded = await uploadDownloadableFile(
        asset.uri,
        asset.name ?? 'product-file',
        asset.mimeType ?? 'application/octet-stream',
      );
      setDownloadFile({
        ...uploaded,
        fileName: asset.name,
        isUploading: false,
      });
    } catch (err) {
      setDownloadFile({
        featuredProduct: '',
        featuredProductUrl: '',
        localUri: asset.uri,
        fileName: asset.name,
        isUploading: false,
        uploadError: getErrorMessage(err, 'Failed to upload file'),
      });
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

    const errors = validateDownloadableProductForm(values, images, hasDownloadFile);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSaveError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);
    setSubmitError(null);

    try {
      const readyImages = await uploadPendingImages(images);
      const editId = savedProductId ?? productId;
      const payload = buildDownloadableProductPayload(
        values,
        readyImages,
        downloadFile,
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
    downloadFile,
    hasDownloadFile,
    images,
    productId,
    productStatus,
    savedProductId,
    sellerId,
    uploadPendingImages,
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
    downloadFile,
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
    pickDownloadFile,
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
