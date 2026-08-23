import { apiPost } from './request';
import type { VerifyOtpResponse } from '../../features/auth/types';
import type { GuestCheckoutProfile } from '../storage/guestSessionStorage';

export interface GuestUserRequest {
  name: string;
  email: string;
  data: Record<string, unknown>;
}

export interface SendGuestOtpResponse {
  success?: boolean;
  otpToken?: string;
  message?: string;
}

export async function createGuestUser(profile: GuestUserRequest): Promise<void> {
  await apiPost<unknown>(
    '/guest-user',
    {
      name: profile.name,
      email: profile.email,
      data: profile.data,
    },
    undefined,
    'Failed to save guest profile',
  );
}

export async function sendGuestCheckoutOtp(
  guest: GuestCheckoutProfile,
): Promise<SendGuestOtpResponse> {
  return apiPost<SendGuestOtpResponse>(
    '/users/send-otp-toEmail',
    { user: guest as unknown as Record<string, unknown> },
    undefined,
    'Failed to send verification code',
  );
}

export async function verifyGuestCheckoutOtp(
  otp: string,
  otpToken: string,
): Promise<VerifyOtpResponse> {
  return apiPost<VerifyOtpResponse>(
    '/users/verify-otp',
    { otp, otpToken },
    undefined,
    'Failed to verify code',
  );
}
