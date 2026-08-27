import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated } from 'react-native';
import type { NavigationContainerRef, NavigationState } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { motion } from '../../../design-system/motion';
import type { RootStackParamList } from '../types';
import { marketplaceNavigationRef } from './marketplaceNavigationRef';
import {
  getMarketplaceFooterContentInset,
  getMarketplaceFooterSafeInset,
  MARKETPLACE_FOOTER_BOTTOM_GAP,
  MARKETPLACE_FOOTER_PILL_HEIGHT,
} from './marketplaceFooterLayout';
import { shouldPinMarketplaceFooter } from './resolveMarketplaceActiveTab';

type FooterAnimationOptions = {
  animated?: boolean;
};

interface MarketplaceChromeContextValue {
  footerTranslateY: Animated.Value;
  footerContentInset: number;
  footerVisible: boolean;
  footerAutoShowSuppressed: boolean;
  /** When true the floating tab footer is not rendered (PDP sticky CTA owns the bottom). */
  footerOverlaySuppressed: boolean;
  rootNavState: NavigationState | undefined;
  navigationRef: NavigationContainerRef<RootStackParamList>;
  reportScroll: (offsetY: number) => void;
  showFooter: (options?: FooterAnimationOptions) => void;
  hideFooter: (options?: FooterAnimationOptions) => void;
  setFooterAutoShowSuppressed: (suppressed: boolean) => void;
  setFooterOverlaySuppressed: (suppressed: boolean) => void;
  setRootNavigationState: (state: NavigationState | undefined) => void;
}

const MarketplaceChromeContext = createContext<MarketplaceChromeContextValue | null>(null);

const SCROLL_DELTA_THRESHOLD = 8;

export function MarketplaceChromeProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const safeBottom = getMarketplaceFooterSafeInset(insets.bottom);
  const footerContentInset = getMarketplaceFooterContentInset(insets.bottom);
  const hideDistance =
    MARKETPLACE_FOOTER_PILL_HEIGHT + MARKETPLACE_FOOTER_BOTTOM_GAP + safeBottom + 12;

  const footerTranslateY = useRef(new Animated.Value(0)).current;
  const lastOffsetY = useRef(0);
  const [footerVisible, setFooterVisible] = useState(true);
  const [footerAutoShowSuppressed, setFooterAutoShowSuppressed] = useState(false);
  const [footerOverlaySuppressed, setFooterOverlaySuppressed] = useState(false);
  const [rootNavState, setRootNavigationState] = useState<NavigationState | undefined>(undefined);

  const animateFooter = useCallback(
    (visible: boolean, animated = true) => {
      setFooterVisible(visible);

      if (!animated) {
        footerTranslateY.setValue(visible ? 0 : hideDistance);
        return;
      }

      Animated.timing(footerTranslateY, {
        toValue: visible ? 0 : hideDistance,
        duration: motion.contentFadeMs,
        useNativeDriver: true,
      }).start();
    },
    [footerTranslateY, hideDistance],
  );

  const showFooter = useCallback(
    (options?: FooterAnimationOptions) => {
      animateFooter(true, options?.animated ?? true);
    },
    [animateFooter],
  );

  const hideFooter = useCallback(
    (options?: FooterAnimationOptions) => {
      animateFooter(false, options?.animated ?? true);
    },
    [animateFooter],
  );

  const reportScroll = useCallback(
    (offsetY: number) => {
      if (shouldPinMarketplaceFooter(rootNavState)) {
        if (!footerVisible) {
          animateFooter(true, false);
        }
        lastOffsetY.current = offsetY;
        return;
      }

      const delta = offsetY - lastOffsetY.current;

      if (offsetY <= 0) {
        if (!footerVisible) {
          animateFooter(true);
        }
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        if (footerVisible) {
          animateFooter(false);
        }
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        if (!footerVisible) {
          animateFooter(true);
        }
      }

      lastOffsetY.current = offsetY;
    },
    [animateFooter, footerVisible, rootNavState],
  );

  const value = useMemo(
    () => ({
      footerTranslateY,
      footerContentInset,
      footerVisible,
      footerAutoShowSuppressed,
      footerOverlaySuppressed,
      rootNavState,
      navigationRef: marketplaceNavigationRef,
      reportScroll,
      showFooter,
      hideFooter,
      setFooterAutoShowSuppressed,
      setFooterOverlaySuppressed,
      setRootNavigationState,
    }),
    [
      footerAutoShowSuppressed,
      footerContentInset,
      footerOverlaySuppressed,
      footerTranslateY,
      footerVisible,
      hideFooter,
      reportScroll,
      rootNavState,
      showFooter,
    ],
  );

  return (
    <MarketplaceChromeContext.Provider value={value}>{children}</MarketplaceChromeContext.Provider>
  );
}

export function useMarketplaceChrome(): MarketplaceChromeContextValue {
  const context = useContext(MarketplaceChromeContext);
  if (!context) {
    throw new Error('useMarketplaceChrome must be used within MarketplaceChromeProvider');
  }
  return context;
}

export function useMarketplaceChromeOptional(): MarketplaceChromeContextValue | null {
  return useContext(MarketplaceChromeContext);
}
