import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from '../api/authApi';
import type { AuthContextValue, AuthState, StoredUserProfile } from '../types';
import { mergeGuestCartIntoAccount } from '../../cart/utils/mergeGuestCartIntoAccount';
import { resolveAuthUserId } from '../utils/resolveAuthUserId';
import {
  clearAuthenticatedSession,
  loadAuthenticatedSession,
  saveAuthenticatedSession,
  updateStoredProfile,
} from '../../../services/auth/authSession';
import { getStoredUserPricingInfo, clearStoredUserPricingInfo } from '../../../services/storage/userPricingStorage';
import { ApiError } from '../../../services/api/errors';

const initialState: AuthState = {
  user: null,
  role: null,
  fullAccess: false,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const refreshSession = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));
    try {
      const session = await loadAuthenticatedSession();
      if (!session) {
        setState({
          user: null,
          role: null,
          fullAccess: false,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      setState({
        user: session.user,
        role: session.role,
        fullAccess: session.fullAccess,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await clearAuthenticatedSession();
      setState({
        user: null,
        role: null,
        fullAccess: false,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const requestOtp = useCallback(async (email: string) => {
    const response = await requestOtpApi(email);
    if (!response.success || !response.otpToken) {
      throw new ApiError(response.error || response.message || 'Sign-in request failed');
    }
    return { otpToken: response.otpToken };
  }, []);

  const verifyOtp = useCallback(async ({ otp, otpToken }: { otp: string; otpToken: string }) => {
    const response = await verifyOtpApi(otp, otpToken);
    if (!response.success || !response.user) {
      throw new ApiError(response.message || 'Invalid OTP');
    }

    const session = await saveAuthenticatedSession(response.user);
    const userId = resolveAuthUserId(session.user);

    if (userId) {
      try {
        const userInfo = await getStoredUserPricingInfo();
        await mergeGuestCartIntoAccount(userId, userInfo);
      } catch {
        // Cart merge should not block successful sign-in.
      }
    }

    setState({
      user: session.user,
      role: session.role,
      fullAccess: session.fullAccess,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    const { disconnectChatSocket } = await import('../../../services/socket/chatSocket');
    disconnectChatSocket();
    await clearAuthenticatedSession();
    await clearStoredUserPricingInfo();
    setState({
      user: null,
      role: null,
      fullAccess: false,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const patchUserProfile = useCallback(async (patch: Partial<StoredUserProfile>) => {
    let nextStoredProfile: StoredUserProfile | null = null;

    setState((current) => {
      if (!current.user) {
        return current;
      }

      const { accessToken, ...storedProfile } = current.user;
      nextStoredProfile = { ...storedProfile, ...patch };

      return {
        ...current,
        user: {
          ...nextStoredProfile,
          accessToken,
        },
      };
    });

    if (nextStoredProfile) {
      await updateStoredProfile(nextStoredProfile);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      requestOtp,
      verifyOtp,
      logout,
      refreshSession,
      patchUserProfile,
    }),
    [state, requestOtp, verifyOtp, logout, refreshSession, patchUserProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
