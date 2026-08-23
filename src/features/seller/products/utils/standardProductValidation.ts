import type { StandardProductFormValues, StandardProductImageEntry } from '../types/standardProductForm';
import type { StandardWizardStepId } from './standardProductConstants';
import { STANDARD_PRODUCT_MIN_IMAGES } from './standardProductConstants';

const NUMERIC_PATTERN = /^[0-9]+(\.[0-9]+)?$/;
const INTEGER_PATTERN = /^[0-9]+$/;

function required(value: string, message = 'Required'): string | undefined {
  return value.trim() ? undefined : message;
}

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

function validateShippingExtras(values: StandardProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.isCustomShipping) {
    return errors;
  }

  if (!values.handlingFee.trim()) {
    errors.handlingFee = 'Required';
  }

  if (values.freeDelivery && values.handlingFee.trim() && !values.additionalCost.trim()) {
    errors.additionalCost = 'Required';
  }

  return errors;
}

export function validateStandardProductStep(
  step: StandardWizardStepId,
  values: StandardProductFormValues,
  images: StandardProductImageEntry[],
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
      if (uploadedCount < STANDARD_PRODUCT_MIN_IMAGES) {
        errors.images = `At least ${STANDARD_PRODUCT_MIN_IMAGES} images are required`;
      }
      break;
    }

    case 'pricing': {
      if (!values.inventory) {
        errors.inventory = 'Required';
      }

      const quantityError = required(values.quantity);
      if (quantityError) {
        errors.quantity = quantityError;
      } else if (!INTEGER_PATTERN.test(values.quantity.trim())) {
        errors.quantity = 'Please enter numbers only';
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

    case 'shipping': {
      for (const [field, label] of [
        ['weight', 'Weight'],
        ['length', 'Length'],
        ['width', 'Width'],
        ['height', 'Height'],
        ['dispatchDays', 'Days'],
      ] as const) {
        const fieldError = positiveNumber(values[field], label);
        if (fieldError) {
          errors[field] = fieldError;
        }
      }

      Object.assign(errors, validateShippingExtras(values));
      break;
    }

    case 'additional':
      break;

    case 'review':
      return validateStandardProductForm(values, images);

    default:
      break;
  }

  return errors;
}

export function validateStandardProductForm(
  values: StandardProductFormValues,
  images: StandardProductImageEntry[],
): Record<string, string> {
  const steps: StandardWizardStepId[] = [
    'basic',
    'categories',
    'images',
    'pricing',
    'shipping',
  ];

  return steps.reduce<Record<string, string>>((accumulator, step) => {
    const stepErrors = validateStandardProductStep(step, values, images);
    return { ...accumulator, ...stepErrors };
  }, {});
}
