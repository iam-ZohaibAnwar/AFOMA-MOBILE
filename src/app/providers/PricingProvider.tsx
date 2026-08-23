import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '../../features/auth/context/AuthProvider';
import {
  bootstrapPricingContext,
  arePricingInfosEqual,
  isValidStoredPricingInfo,
  refreshGuestGeoPricing,
  resolveLoginCountry,
  updateLoginPricingFromCountry,
} from '../../services/pricing/geoPricingService';
import type { UserPricingInfo } from '../../services/pricing/types';
import { getStoredUserPricingInfo } from '../../services/storage/userPricingStorage';

interface PricingContextValue {
  userInfo: UserPricingInfo;
  pricingEpoch: number;
  isPricingReady: boolean;
  refreshPricing: () => Promise<void>;
}

const defaultUserInfo: UserPricingInfo = {
  currency: 'CAD',
  currencyRate: 1,
};

const PricingContext = createContext<PricingContextValue | undefined>(undefined);

export function PricingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [userInfo, setUserInfo] = useState<UserPricingInfo>(defaultUserInfo);
  const [pricingEpoch, setPricingEpoch] = useState(0);
  const [isPricingReady, setIsPricingReady] = useState(true);
  const bootstrapStartedRef = useRef(false);
  const prevAuthenticatedRef = useRef<boolean | null>(null);

  const applyPricingUpdate = useCallback((nextInfo: UserPricingInfo, changed: boolean) => {
    setUserInfo((prev) => {
      if (!changed && arePricingInfosEqual(prev, nextInfo)) {
        return prev;
      }
      return nextInfo;
    });

    if (changed) {
      setPricingEpoch((value) => value + 1);
    }
  }, []);

  const refreshPricing = useCallback(async () => {
    if (isAuthenticated && user) {
      const loginCountry = resolveLoginCountry(user);
      if (loginCountry) {
        const { userInfo: nextInfo, changed } = await updateLoginPricingFromCountry(loginCountry);
        applyPricingUpdate(nextInfo, changed);
        return;
      }
    }

    const { userInfo: nextInfo, changed } = await refreshGuestGeoPricing();
    applyPricingUpdate(nextInfo, changed);
  }, [applyPricingUpdate, isAuthenticated, user]);

  useEffect(() => {
    if (isLoading || bootstrapStartedRef.current) {
      return;
    }

    bootstrapStartedRef.current = true;

    void (async () => {
      const stored = await getStoredUserPricingInfo();
      if (isValidStoredPricingInfo(stored)) {
        setUserInfo({ ...defaultUserInfo, ...stored });
      }

      setIsPricingReady(true);

      try {
        const loginCountry =
          isAuthenticated && user ? resolveLoginCountry(user) : undefined;
        const result = await bootstrapPricingContext({
          isAuthenticated,
          loginCountry,
        });
        applyPricingUpdate(result.userInfo, result.changed);
      } catch {
        // Keep cached/default pricing visible; geo can retry via refreshPricing.
      }
    })();
  }, [applyPricingUpdate, isAuthenticated, isLoading, user]);

  // Match web logout/login: account country while signed in, IP geo as guest.
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const prevAuthenticated = prevAuthenticatedRef.current;
    prevAuthenticatedRef.current = isAuthenticated;

    if (prevAuthenticated === null || prevAuthenticated === isAuthenticated) {
      return;
    }

    void refreshPricing();
  }, [isAuthenticated, isLoading, refreshPricing]);

  const value = useMemo(
    () => ({
      userInfo,
      pricingEpoch,
      isPricingReady,
      refreshPricing,
    }),
    [isPricingReady, pricingEpoch, refreshPricing, userInfo],
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing(): PricingContextValue {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within PricingProvider');
  }
  return context;
}

export function useDisplayCurrency(): string {
  const { userInfo } = usePricing();

  if (userInfo.currency?.trim()) {
    return userInfo.currency.trim();
  }

  return 'CAD';
}
