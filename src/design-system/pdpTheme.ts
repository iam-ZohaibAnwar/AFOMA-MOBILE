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
  pillUnselectedBg: string;
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

/** AFOMA PDP uses warm orange surfaces like the web storefront — not system dark mode. */
const lightTheme: PdpTheme = {
  background: lightColors.background,
  surface: lightColors.surface,
  surfaceMuted: lightColors.background,
  textPrimary: lightColors.textPrimary,
  textSecondary: lightColors.textSecondary,
  textMuted: lightColors.textMuted,
  border: lightColors.border,
  overlay: lightColors.overlay,
  overlayText: lightColors.textInverse,
  floatingButtonBg: lightColors.surface,
  floatingButtonBorder: lightColors.border,
  thumbnailActiveBorder: lightColors.primary,
  discountRibbonBg: lightColors.error,
  discountRibbonText: lightColors.textInverse,
  deliveryBannerBg: lightColors.surface,
  deliveryBannerBorder: lightColors.border,
  deliveryBannerText: lightColors.textPrimary,
  deliveryBannerIcon: lightColors.primary,
  starFilled: '#EAB308',
  starEmpty: lightColors.borderForm,
  pillSelectedBg: lightColors.primary,
  pillSelectedText: lightColors.textInverse,
  pillUnselectedBg: lightColors.background,
  pillBorder: lightColors.borderForm,
  pillText: lightColors.textPrimary,
  pillDisabledText: lightColors.disabledText,
  swatchBorder: lightColors.borderForm,
  swatchSelectedRing: lightColors.primary,
  stickyBarBg: lightColors.surface,
  stickyBarBorder: lightColors.border,
  imageCounterBg: lightColors.overlay,
  imageCounterText: lightColors.textInverse,
};

export function usePdpTheme(): PdpTheme {
  return lightTheme;
}
