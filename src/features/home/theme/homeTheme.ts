import { Platform, type ViewStyle } from 'react-native';

export const homeColors = {
  background: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceMuted: '#FFFBEB',
  surfaceWarm: '#FFEDD5',
  primary: '#EA580C',
  primarySoft: '#FB923C',
  navy: '#172554',
  navyMuted: '#1E3A8A',
  text: '#172554',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  border: '#FED7AA',
  borderLight: '#FFE4C7',
  accent: '#1D4ED8',
  success: '#047857',
  error: '#B91C1C',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
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
    color: homeColors.primary,
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
