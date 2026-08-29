import { validateCouponCode } from '../../../../utils/couponCodeRules';
import type {
  AdminCouponFormValues,
  AdminCouponListItem,
  AdminCouponType,
  CreateAdminCouponPayload,
  UpdateAdminCouponPayload,
} from '../types/adminCoupons';
import {
  buildAdminCouponUpdatePayload,
  isAdminCouponType,
  toAdminCouponExpirationInputValue,
} from './adminCouponsContent';

export type AdminCouponFormErrors = Partial<Record<keyof AdminCouponFormValues, string>>;

const EXPIRATION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseRequiredNumber(
  value: string,
  label: string,
  options: { integerOnly?: boolean; min?: number; max?: number } = {},
): { value?: number; error?: string } {
  const trimmed = value.trim();
  const min = options.min ?? 1;

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

  if (parsed < min) {
    return { error: `${label} must be at least ${min}` };
  }

  if (options.max != null && parsed > options.max) {
    return { error: `${label} must be at most ${options.max}` };
  }

  return { value: parsed };
}

function validateExpirationDate(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Expiration date is required';
  }

  if (!EXPIRATION_DATE_REGEX.test(trimmed)) {
    return 'Select a valid expiration date';
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

  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (parsed.getTime() < todayUtc.getTime()) {
    return 'Expiration date must be today or later';
  }

  return null;
}

function validateDiscountAmount(
  value: string,
  couponType: AdminCouponType | '',
): string | null {
  const max = couponType === 'percentage' ? 100 : undefined;
  const discount = parseRequiredNumber(value, 'Discount', { min: 1, max });
  if (discount.error) {
    return discount.error;
  }

  return null;
}

export function createEmptyAdminCouponFormValues(): AdminCouponFormValues {
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

export function mapAdminCouponToFormValues(coupon: AdminCouponListItem): AdminCouponFormValues {
  return {
    couponCode: coupon.couponCode ?? '',
    couponType: isAdminCouponType(String(coupon.couponType ?? '')) ? coupon.couponType as AdminCouponType : '',
    description: coupon.description ?? '',
    discountAmount: coupon.discountAmount != null ? String(coupon.discountAmount) : '',
    minimumCartAmount: coupon.minimumCartAmount != null ? String(coupon.minimumCartAmount) : '',
    expirationDate: toAdminCouponExpirationInputValue(coupon.expirationDate),
    usageLimitPerCoupon:
      coupon.usageLimitPerCoupon != null ? String(coupon.usageLimitPerCoupon) : '',
    usageLimitPerCustomer:
      coupon.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : '',
  };
}

export function validateAdminCouponForm(values: AdminCouponFormValues): AdminCouponFormErrors {
  const errors: AdminCouponFormErrors = {};

  const couponCodeError = validateCouponCode(values.couponCode);
  if (couponCodeError) {
    errors.couponCode = couponCodeError;
  }

  if (!values.couponType) {
    errors.couponType = 'Coupon type is required';
  } else if (!isAdminCouponType(values.couponType)) {
    errors.couponType = 'Invalid coupon type';
  }

  const discountError = validateDiscountAmount(values.discountAmount, values.couponType);
  if (discountError) {
    errors.discountAmount = discountError;
  }

  const minimumCart = parseRequiredNumber(values.minimumCartAmount, 'Minimum cart amount', { min: 1 });
  if (minimumCart.error) {
    errors.minimumCartAmount = minimumCart.error;
  }

  const expirationError = validateExpirationDate(values.expirationDate);
  if (expirationError) {
    errors.expirationDate = expirationError;
  }

  const usagePerCoupon = parseRequiredNumber(values.usageLimitPerCoupon, 'Usage limit per coupon', {
    integerOnly: true,
    min: 1,
  });
  if (usagePerCoupon.error) {
    errors.usageLimitPerCoupon = usagePerCoupon.error;
  }

  const usagePerCustomer = parseRequiredNumber(
    values.usageLimitPerCustomer,
    'Usage limit per customer',
    { integerOnly: true, min: 1 },
  );
  if (usagePerCustomer.error) {
    errors.usageLimitPerCustomer = usagePerCustomer.error;
  }

  return errors;
}

export function hasAdminCouponFormErrors(errors: AdminCouponFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

function buildValidatedCouponFields(
  values: AdminCouponFormValues,
): Omit<CreateAdminCouponPayload, 'createdBy'> | null {
  const errors = validateAdminCouponForm(values);
  if (hasAdminCouponFormErrors(errors) || !isAdminCouponType(values.couponType)) {
    return null;
  }

  return {
    couponCode: values.couponCode.trim(),
    couponType: values.couponType,
    description: values.description.trim() || undefined,
    discountAmount: Number(values.discountAmount.trim()),
    minimumCartAmount: Number(values.minimumCartAmount.trim()),
    expirationDate: values.expirationDate.trim(),
    usageLimitPerCoupon: Number(values.usageLimitPerCoupon.trim()),
    usageLimitPerCustomer: Number(values.usageLimitPerCustomer.trim()),
  };
}

export function buildAdminCouponCreatePayload(
  values: AdminCouponFormValues,
  adminUserId: string,
): { payload?: CreateAdminCouponPayload; errors: AdminCouponFormErrors } {
  const errors = validateAdminCouponForm(values);
  if (hasAdminCouponFormErrors(errors)) {
    return { errors };
  }

  const fields = buildValidatedCouponFields(values);
  if (!fields) {
    return { errors: validateAdminCouponForm(values) };
  }

  return {
    errors: {},
    payload: {
      ...fields,
      createdBy: adminUserId,
    },
  };
}

export function buildAdminCouponEditPayload(
  values: AdminCouponFormValues,
  existingCoupon: AdminCouponListItem,
): { payload?: UpdateAdminCouponPayload; errors: AdminCouponFormErrors } {
  const errors = validateAdminCouponForm(values);
  if (hasAdminCouponFormErrors(errors)) {
    return { errors };
  }

  const fields = buildValidatedCouponFields(values);
  if (!fields) {
    return { errors: validateAdminCouponForm(values) };
  }

  try {
    return {
      errors: {},
      payload: buildAdminCouponUpdatePayload(existingCoupon, fields),
    };
  } catch {
    return {
      errors: { couponCode: 'Unable to resolve coupon owner for update' },
    };
  }
}
