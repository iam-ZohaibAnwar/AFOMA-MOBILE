import { Platform, type ViewStyle } from 'react-native';

import { colors } from '../../../design-system';

/** Home-specific layout tokens aligned with global AFOMA colors. */
export const homeColors = {
  background: colors.background,
  surface: colors.surface,
  surfaceMuted: colors.surfaceMuted,
  surfaceWarm: colors.surfaceSecondary,
  primary: colors.primary,
  primarySoft: colors.primarySoft,
  accent: colors.secondary,
  accentSoft: colors.secondarySoft,
  navy: colors.textPrimary,
  navyMuted: '#1E3A8A',
  text: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  textSubtle: colors.textSubtle,
  border: colors.border,
  borderLight: '#FFE4C7',
  success: colors.success,
  error: colors.error,
  errorBg: colors.errorBg,
  errorBorder: colors.errorBorder,
};

export const homeSpacing = {
  screen: 20,
  section: 32,
  block: 16,
  cardGap: 12,
};

export const homeRadii = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const homeTypography = {
  logo: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    color: homeColors.navy,
  },
  logoAccent: {
    color: homeColors.accent,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: homeColors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: homeColors.textMuted,
    lineHeight: 18,
  },
  body: {
    fontSize: 15,
    color: homeColors.textSecondary,
    lineHeight: 22,
  },
};

function createShadow(opacity: number, radius: number, height: number, elevation: number): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: homeColors.navy,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {},
  }) as ViewStyle;
}

export const homeShadows = {
  soft: createShadow(0.06, 10, 3, 2),
  card: createShadow(0.08, 14, 4, 4),
  header: createShadow(0.05, 8, 2, 3),
  search: createShadow(0.04, 6, 2, 2),
};

export function getHomeProductCardWidth(screenWidth: number, columns = 2): number {
  const horizontalPadding = homeSpacing.screen * 2;
  const totalGap = homeSpacing.cardGap * (columns - 1);
  return (screenWidth - horizontalPadding - totalGap) / columns;
}

export function getHomeCategoryCardWidth(screenWidth: number): number {
  const visibleCards = screenWidth >= 768 ? 4.2 : 2.6;
  const horizontalPadding = homeSpacing.screen * 2;
  const gaps = homeSpacing.cardGap * 2;
  return Math.max(112, (screenWidth - horizontalPadding - gaps) / visibleCards);
}
