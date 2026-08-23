import { useColorScheme } from 'react-native';

import { colors as lightColors } from './colors';

export interface PdpTheme {
  background: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  overlay: string;
  overlayText: string;
  floatingButtonBg: string;
  floatingButtonBorder: string;
  thumbnailActiveBorder: string;
  discountRibbonBg: string;
  discountRibbonText: string;
  deliveryBannerBg: string;
  deliveryBannerBorder: string;
  deliveryBannerText: string;
  deliveryBannerIcon: string;
  starFilled: string;
  starEmpty: string;
  pillSelectedBg: string;
  pillSelectedText: string;
  pillBorder: string;
  pillText: string;
  pillDisabledText: string;
  swatchBorder: string;
  swatchSelectedRing: string;
  stickyBarBg: string;
  stickyBarBorder: string;
  imageCounterBg: string;
  imageCounterText: string;
}

const lightTheme: PdpTheme = {
  background: lightColors.background,
  surface: lightColors.surface,
  surfaceMuted: lightColors.surfaceMuted,
  textPrimary: lightColors.textPrimary,
  textSecondary: lightColors.textSecondary,
  textMuted: lightColors.textMuted,
  border: lightColors.borderStrong,
  overlay: 'rgba(15, 23, 42, 0.72)',
  overlayText: lightColors.textInverse,
  floatingButtonBg: lightColors.surfaceMuted,
  floatingButtonBorder: lightColors.borderStrong,
  thumbnailActiveBorder: lightColors.primary,
  discountRibbonBg: lightColors.error,
  discountRibbonText: lightColors.textInverse,
  deliveryBannerBg: lightColors.surfaceSecondary,
  deliveryBannerBorder: lightColors.border,
  deliveryBannerText: lightColors.textPrimary,
  deliveryBannerIcon: lightColors.primary,
  starFilled: '#EAB308',
  starEmpty: lightColors.borderStrong,
  pillSelectedBg: lightColors.primary,
  pillSelectedText: lightColors.textInverse,
  pillBorder: lightColors.borderStrong,
  pillText: lightColors.textPrimary,
  pillDisabledText: lightColors.disabledText,
  swatchBorder: lightColors.borderStrong,
  swatchSelectedRing: lightColors.primary,
  stickyBarBg: lightColors.background,
  stickyBarBorder: lightColors.border,
  imageCounterBg: 'rgba(15, 23, 42, 0.72)',
  imageCounterText: lightColors.textInverse,
};

const darkTheme: PdpTheme = {
  background: '#0B1220',
  surface: '#111827',
  surfaceMuted: '#1F2937',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  overlay: 'rgba(2, 6, 23, 0.78)',
  overlayText: '#F8FAFC',
  floatingButtonBg: '#1F2937',
  floatingButtonBorder: '#475569',
  thumbnailActiveBorder: lightColors.primary,
  discountRibbonBg: lightColors.error,
  discountRibbonText: lightColors.textInverse,
  deliveryBannerBg: '#7C2D12',
  deliveryBannerBorder: '#EA580C',
  deliveryBannerText: '#FFEDD5',
  deliveryBannerIcon: '#FED7AA',
  starFilled: '#EAB308',
  starEmpty: '#475569',
  pillSelectedBg: lightColors.primary,
  pillSelectedText: lightColors.textInverse,
  pillBorder: '#475569',
  pillText: '#F8FAFC',
  pillDisabledText: '#64748B',
  swatchBorder: '#475569',
  swatchSelectedRing: lightColors.primary,
  stickyBarBg: '#111827',
  stickyBarBorder: '#334155',
  imageCounterBg: 'rgba(2, 6, 23, 0.82)',
  imageCounterText: '#F8FAFC',
};

export function usePdpTheme(): PdpTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
