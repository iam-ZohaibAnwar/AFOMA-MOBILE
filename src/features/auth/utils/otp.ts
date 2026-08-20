import { OTP_LENGTH } from '../../../constants/auth';

export function sanitizeOtpInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function isCompleteOtp(value: string): boolean {
  return sanitizeOtpInput(value).length === OTP_LENGTH;
}
