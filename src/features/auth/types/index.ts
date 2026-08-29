export type UserRole = 'customer' | 'seller' | 'affiliate' | 'admin';

/**
 * Fields confirmed from web OTP login usage.
 * TODO: Verify full backend user object after live API capture.
 */
export interface StoredUserProfile {
  userRole?: UserRole;
  userId?: string;
  sellerId?: string;
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  countryName?: string;
  Country?: string;
  countryCode?: string;
  stateCode?: string;
  streetAddress?: string;
  state?: string;
  city?: string;
  ZipCode?: string;
  zipcode?: string;
  phone?: string;
  moNumber?: string;
  gender?: string;
  DOB?: string;
  web3address?: string;
  networkType?: string;
  userProfile?: string;
  company?: string;
}

export interface AuthUser extends StoredUserProfile {
  accessToken: string;
}

export interface JwtPayload {
  role?: UserRole;
  fullAccess?: boolean;
  exp?: number;
}

export interface RequestOtpResponse {
  success: boolean;
  otpToken?: string;
  error?: string;
  message?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  user?: VerifyOtpUserPayload;
  message?: string;
}

/**
 * Only fields read by the web app after OTP verify are typed here.
 * TODO: Extend after backend response verification.
 */
export interface VerifyOtpUserPayload extends StoredUserProfile {
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  fullAccess: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  requestOtp: (email: string) => Promise<{ otpToken: string }>;
  verifyOtp: (params: { otp: string; otpToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  patchUserProfile: (patch: Partial<StoredUserProfile>) => Promise<void>;
}
