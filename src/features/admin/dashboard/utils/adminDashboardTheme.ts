import { colors, radius, shadows, spacing } from '../../../../design-system';

/** Admin dashboard tokens — AFOMA warm surfaces + primary blue actions. */
export const adminDashboardTheme = {
  screenBackground: colors.background,
  headerBackground: colors.surfaceMuted,
  /** Warm peach cards — matches web `bg-orange-100`, not stark white. */
  cardBackground: colors.surface,
  kpiValueColor: colors.primary,
  /** Solid fill + white icon — matches admin seller management. */
  kpiIconBackground: colors.primary,
  kpiIconColor: colors.textInverse,
  /** User engagement doughnut — matches web ChartPieAdmin legend colors. */
  engagementUserColor: colors.primary,
  engagementSellerColor: colors.border,
  engagementAffiliateColor: '#FFAB91',
  chartTrackBackground: colors.background,
  alertCriticalButton: colors.error,
  alertReviewButton: colors.secondary,
  alertViewAllBackground: colors.primarySoft,
  alertViewAllText: colors.primary,
  alertCriticalCardBackground: colors.errorBg,
  alertWarningCardBackground: colors.secondaryMuted,
  alertCriticalIconBackground: colors.error,
  alertWarningIconBackground: colors.warning,
  alertIconColor: colors.textInverse,
  navActiveBackground: colors.primary,
  navBackground: colors.surfaceWhite,
  navBorder: colors.border,
  iconButtonBackground: colors.primary,
  iconButtonColor: colors.textInverse,
  sectionGap: spacing.xl,
  cardRadius: radius.xl,
  cardBorder: colors.border,
  cardShadow: shadows.card,
  bottomNavHeight: 72,
} as const;
