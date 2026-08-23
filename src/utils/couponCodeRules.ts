export const COUPON_CODE_MIN_LEN = 3;
export const COUPON_CODE_MAX_LEN = 32;
export const COUPON_CODE_REGEX = /^[A-Za-z0-9-]+$/;

export function normalizeCouponCode(value: string): string {
  return value.trim();
}

export function validateCouponCode(value: string): string | null {
  const code = normalizeCouponCode(value);

  if (!code) {
    return 'Coupon code is required';
  }

  if (code.length < COUPON_CODE_MIN_LEN) {
    return `Coupon code must be at least ${COUPON_CODE_MIN_LEN} characters`;
  }

  if (code.length > COUPON_CODE_MAX_LEN) {
    return `Coupon code must be at most ${COUPON_CODE_MAX_LEN} characters`;
  }

  if (!COUPON_CODE_REGEX.test(code)) {
    return 'Use only letters, numbers, and hyphens (no spaces)';
  }

  return null;
}
