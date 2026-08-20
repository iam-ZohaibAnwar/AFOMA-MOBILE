import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from '../api/authApi';
import type { AuthContextValue, AuthState } from '../types';
import {
  clearAuthenticatedSession,
  loadAuthenticatedSession,
  saveAuthenticatedSession,
} from '../../../services/auth/authSession';
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
    setState({
      user: session.user,
      role: session.role,
      fullAccess: session.fullAccess,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    await clearAuthenticatedSession();
    setState({
      user: null,
      role: null,
      fullAccess: false,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      requestOtp,
      verifyOtp,
      logout,
      refreshSession,
    }),
    [state, requestOtp, verifyOtp, logout, refreshSession],
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
