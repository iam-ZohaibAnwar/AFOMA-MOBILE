import { validateCouponCode } from '../../../../utils/couponCodeRules';
import type {
  SellerCouponFormErrors,
  SellerCouponFormValues,
  SellerCouponType,
} from '../types/sellerCoupon';

const EXPIRATION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseRequiredNumber(
  value: string,
  label: string,
  options: { integerOnly?: boolean } = {},
): { value?: number; error?: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return { error: `${label} is required` };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a number` };
  }

  if (options.integerOnly && !Number.isInteger(parsed)) {
    return { error: `${label} must be a whole number` };
  }

  if (parsed < 1) {
    return { error: `${label} must be at least 1` };
  }

  return { value: parsed };
}

function validateExpirationDate(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Expiration date is required';
  }

  if (!EXPIRATION_DATE_REGEX.test(trimmed)) {
    return 'Enter expiration date as YYYY-MM-DD';
  }

  const [yearText, monthText, dayText] = trimmed.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return 'Enter a valid expiration date';
  }

  return null;
}

function validateDiscountAmount(
  value: string,
  couponType: SellerCouponType | '',
): string | null {
  const discount = parseRequiredNumber(value, 'Discount');
  if (discount.error) {
    return discount.error;
  }

  if (couponType === 'percentage' && discount.value != null && discount.value > 100) {
    return 'Percentage discount cannot exceed 100';
  }

  return null;
}

export function validateSellerCouponForm(values: SellerCouponFormValues): SellerCouponFormErrors {
  const errors: SellerCouponFormErrors = {};

  const couponCodeError = validateCouponCode(values.couponCode);
  if (couponCodeError) {
    errors.couponCode = couponCodeError;
  }

  if (!values.couponType) {
    errors.couponType = 'Coupon type is required';
  } else if (values.couponType !== 'percentage' && values.couponType !== 'fixed') {
    errors.couponType = 'Invalid coupon type';
  }

  const discountError = validateDiscountAmount(values.discountAmount, values.couponType);
  if (discountError) {
    errors.discountAmount = discountError;
  }

  const minimumCart = parseRequiredNumber(values.minimumCartAmount, 'Minimum cart amount');
  if (minimumCart.error) {
    errors.minimumCartAmount = minimumCart.error;
  }

  const expirationError = validateExpirationDate(values.expirationDate);
  if (expirationError) {
    errors.expirationDate = expirationError;
  }

  const usagePerCoupon = parseRequiredNumber(values.usageLimitPerCoupon, 'Usage limit per coupon', {
    integerOnly: true,
  });
  if (usagePerCoupon.error) {
    errors.usageLimitPerCoupon = usagePerCoupon.error;
  }

  const usagePerCustomer = parseRequiredNumber(
    values.usageLimitPerCustomer,
    'Usage limit per customer',
    { integerOnly: true },
  );
  if (usagePerCustomer.error) {
    errors.usageLimitPerCustomer = usagePerCustomer.error;
  }

  return errors;
}

export function hasSellerCouponFormErrors(errors: SellerCouponFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildSellerCouponPayload(
  values: SellerCouponFormValues,
  userId: string,
): {
  payload?: {
    couponCode: string;
    couponType: SellerCouponType;
    description?: string;
    discountAmount: number;
    minimumCartAmount: number;
    expirationDate: string;
    usageLimitPerCoupon: number;
    usageLimitPerCustomer: number;
    createdBy: string;
  };
  errors: SellerCouponFormErrors;
} {
  const errors = validateSellerCouponForm(values);

  if (hasSellerCouponFormErrors(errors)) {
    return { errors };
  }

  const discountAmount = Number(values.discountAmount.trim());
  const minimumCartAmount = Number(values.minimumCartAmount.trim());
  const usageLimitPerCoupon = Number(values.usageLimitPerCoupon.trim());
  const usageLimitPerCustomer = Number(values.usageLimitPerCustomer.trim());

  return {
    errors,
    payload: {
      couponCode: values.couponCode.trim(),
      couponType: values.couponType as SellerCouponType,
      description: values.description.trim() || undefined,
      discountAmount,
      minimumCartAmount,
      expirationDate: values.expirationDate.trim(),
      usageLimitPerCoupon,
      usageLimitPerCustomer,
      createdBy: userId,
    },
  };
}

export function createEmptySellerCouponFormValues(): SellerCouponFormValues {
  return {
    couponCode: '',
    couponType: '',
    description: '',
    discountAmount: '',
    minimumCartAmount: '',
    expirationDate: '',
    usageLimitPerCoupon: '',
    usageLimitPerCustomer: '',
  };
}

export function mapSellerCouponToFormValues(coupon: {
  couponCode?: string;
  couponType?: string;
  description?: string;
  discountAmount?: number;
  minimumCartAmount?: number;
  expirationDate?: string;
  usageLimitPerCoupon?: number;
  usageLimitPerCustomer?: number;
}): SellerCouponFormValues {
  const expirationDate = coupon.expirationDate
    ? new Date(coupon.expirationDate).toISOString().split('T')[0]
    : '';

  return {
    couponCode: coupon.couponCode ?? '',
    couponType: coupon.couponType === 'fixed' || coupon.couponType === 'percentage'
      ? coupon.couponType
      : '',
    description: coupon.description ?? '',
    discountAmount: coupon.discountAmount != null ? String(coupon.discountAmount) : '',
    minimumCartAmount:
      coupon.minimumCartAmount != null ? String(coupon.minimumCartAmount) : '',
    expirationDate,
    usageLimitPerCoupon:
      coupon.usageLimitPerCoupon != null ? String(coupon.usageLimitPerCoupon) : '',
    usageLimitPerCustomer:
      coupon.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : '',
  };
}
