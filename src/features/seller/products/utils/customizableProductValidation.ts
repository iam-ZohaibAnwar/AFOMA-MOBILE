import type { CustomizableProductFormValues } from '../types/customizableProductForm';
import type { VariationRow } from '../types/customizableProductForm';
import type { StandardProductImageEntry } from '../types/standardProductForm';
import type { CustomizableWizardStepId } from './productTypeConstants';
import { CUSTOMIZABLE_PRODUCT_MIN_IMAGES } from './productTypeConstants';

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

function validateShippingExtras(values: CustomizableProductFormValues): Record<string, string> {
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

export function validateCustomizableProductStep(
  step: CustomizableWizardStepId,
  values: CustomizableProductFormValues,
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
      if (uploadedCount < CUSTOMIZABLE_PRODUCT_MIN_IMAGES) {
        errors.images = `At least ${CUSTOMIZABLE_PRODUCT_MIN_IMAGES} images are required`;
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
      return validateCustomizableProductForm(values, images);

    default:
      break;
  }

  return errors;
}

export function validateCustomizableProductForm(
  values: CustomizableProductFormValues,
  images: StandardProductImageEntry[],
): Record<string, string> {
  const steps: CustomizableWizardStepId[] = ['basic', 'categories', 'images', 'shipping'];

  return steps.reduce<Record<string, string>>((accumulator, step) => {
    const stepErrors = validateCustomizableProductStep(step, values, images);
    return { ...accumulator, ...stepErrors };
  }, {});
}

export function validateVariationRows(
  rows: VariationRow[],
  selectedAttributes: string[],
  hasCurrency: boolean,
  hasImages: boolean,
): Record<number, Record<string, string>> {
  const rowErrors: Record<number, Record<string, string>> = {};

  rows.forEach((row, index) => {
    const errors: Record<string, string> = {};

    selectedAttributes.forEach((attribute) => {
      if (!String(row[attribute] ?? '').trim()) {
        errors[attribute] = 'Required';
      }
    });

    if (!row.inventory.trim()) {
      errors.inventory = 'Required';
    }

    if (row.inventory === 'In Stock' && !String(row.quantity ?? '').trim()) {
      errors.quantity = 'Required';
    }

    if (hasCurrency && !String(row.currencyPrice ?? '').trim()) {
      errors.currencyPrice = 'Required';
    }

    if (hasImages && !String(row.image ?? '').trim()) {
      errors.image = 'Required';
    }

    if (!String(row.price ?? '').trim()) {
      errors.price = 'Required';
    }

    if (Object.keys(errors).length > 0) {
      rowErrors[index] = errors;
    }
  });

  return rowErrors;
}
