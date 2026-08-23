import type { DownloadableProductFormValues } from '../types/downloadableProductForm';
import type { StandardProductImageEntry } from '../types/standardProductForm';
import type { DownloadableWizardStepId } from './productTypeConstants';
import { DOWNLOADABLE_PRODUCT_MIN_IMAGES } from './productTypeConstants';

const NUMERIC_PATTERN = /^[0-9]+(\.[0-9]+)?$/;

function positiveNumber(value: string, label: string): string | undefined {
  if (!value.trim()) {
    return 'Required';
  }

  if (!NUMERIC_PATTERN.test(value.trim())) {
    return 'Please enter numbers only';
  }

  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return `${label} must be greater than 0`;
  }

  return undefined;
}

export function validateDownloadableProductStep(
  step: DownloadableWizardStepId,
  values: DownloadableProductFormValues,
  images: StandardProductImageEntry[],
  hasDownloadFile: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  switch (step) {
    case 'basic': {
      if (!values.productName.trim()) {
        errors.productName = 'Required';
      } else if (values.productName.trim().length > 120) {
        errors.productName = 'Product title must be 120 characters or less';
      }

      if (!values.description.trim()) {
        errors.description = 'Required';
      }
      break;
    }

    case 'categories': {
      if (!values.categoryId) {
        errors.categoryId = 'Required';
      }
      if (!values.subCategoryId) {
        errors.subCategoryId = 'Required';
      }
      break;
    }

    case 'images': {
      const uploadedCount = images.filter((image) => image.imageUrl).length;
      if (uploadedCount < DOWNLOADABLE_PRODUCT_MIN_IMAGES) {
        errors.images = `At least ${DOWNLOADABLE_PRODUCT_MIN_IMAGES} images are required`;
      }
      break;
    }

    case 'pricing': {
      if (!values.inventory) {
        errors.inventory = 'Required';
      }

      const priceError = positiveNumber(values.price, 'Price');
      if (priceError) {
        errors.price = priceError;
      }

      if (values.currency && values.currency !== 'cad' && !values.currencyPrice.trim()) {
        errors.currencyPrice = 'Required';
      }
      break;
    }

    case 'download': {
      if (!hasDownloadFile) {
        errors.downloadFile = 'Downloadable file is required';
      }
      break;
    }

    case 'additional':
      break;

    case 'review':
      return validateDownloadableProductForm(values, images, hasDownloadFile);

    default:
      break;
  }

  return errors;
}

export function validateDownloadableProductForm(
  values: DownloadableProductFormValues,
  images: StandardProductImageEntry[],
  hasDownloadFile: boolean,
): Record<string, string> {
  const steps: DownloadableWizardStepId[] = [
    'basic',
    'categories',
    'images',
    'pricing',
    'download',
  ];

  return steps.reduce<Record<string, string>>((accumulator, step) => {
    const stepErrors = validateDownloadableProductStep(step, values, images, hasDownloadFile);
    return { ...accumulator, ...stepErrors };
  }, {});
}
