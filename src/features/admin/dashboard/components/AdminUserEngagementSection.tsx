import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminLatestSeller, AdminPopularSearchTerm, AdminUserCounts } from '../types/adminDashboard';
import { formatAdminCount } from '../utils/adminDashboardDisplay';
import { buildWeeklyEngagementBars, countNewSignupsThisWeek } from '../utils/adminEngagementChart';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';
import { AdminSectionTitle } from './AdminSectionTitle';

export interface AdminUserEngagementSectionProps {
  userCounts: AdminUserCounts | null;
  latestSellers: AdminLatestSeller[];
  searchTerms: AdminPopularSearchTerm[];
  error?: string;
  onRetry?: () => void;
}

function EngagementBarChart({
  latestSellers,
  searchTerms,
}: {
  latestSellers: AdminLatestSeller[];
  searchTerms: AdminPopularSearchTerm[];
}) {
  const bars = buildWeeklyEngagementBars(latestSellers, searchTerms);
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartBars}>
        {bars.map((bar, index) => {
          const barHeight = Math.max(10, Math.round((bar.value / maxValue) * 112));
          const barColor =
            adminDashboardTheme.chartBarColors[index % adminDashboardTheme.chartBarColors.length];

          return (
            <View key={`${bar.label}-${index}`} style={styles.chartColumn}>
              <View style={styles.chartBarTrack}>
                <View style={[styles.chartBarFill, { height: barHeight, backgroundColor: barColor }]} />
              </View>
              <AppText variant="caption" color="textMuted" style={styles.chartLabel}>
                {bar.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EngagementStat({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success';
}) {
  const iconBackground =
    tone === 'success' ? colors.success : adminDashboardTheme.kpiIconBackground;

  return (
    <View style={styles.statRow}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={18} color={adminDashboardTheme.kpiIconColor} />
      </View>
      <View style={styles.statCopy}>
        <AppText variant="bodySmall" color="textSecondary">
          {label}
        </AppText>
        <AppText variant="bodyMedium" style={styles.statValue}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

export function AdminUserEngagementSection({
  userCounts,
  latestSellers,
  searchTerms,
  error,
  onRetry,
}: AdminUserEngagementSectionProps) {
  const newSignups = countNewSignupsThisWeek(latestSellers);

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="User Engagement" showIcon={false} />

      <View style={styles.card}>
        <View style={styles.content}>
          <EngagementBarChart latestSellers={latestSellers} searchTerms={searchTerms} />

          <View style={styles.statsList}>
            <EngagementStat
              label="Active Users"
              value={formatAdminCount(userCounts?.userCount)}
              icon="people-outline"
            />
            <EngagementStat
              label="New Signups (This Week)"
              value={formatAdminCount(newSignups)}
              icon="person-add-outline"
              tone="success"
            />
          </View>
        </View>

        {error ? <ErrorState message={error} onAction={onRetry} style={styles.error} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: adminDashboardTheme.cardBackground,
    borderRadius: adminDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: adminDashboardTheme.cardBorder,
    ...adminDashboardTheme.cardShadow,
  },
  content: {
    gap: spacing.lg,
  },
  chartWrap: {
    paddingTop: spacing.xs,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
    minHeight: 140,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  chartBarTrack: {
    width: '100%',
    maxWidth: 36,
    height: 112,
    borderRadius: radius.medium,
    backgroundColor: adminDashboardTheme.chartTrackBackground,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: radius.medium,
  },
  chartLabel: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 11,
  },
  statsList: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statCopy: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    marginHorizontal: 0,
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
});
