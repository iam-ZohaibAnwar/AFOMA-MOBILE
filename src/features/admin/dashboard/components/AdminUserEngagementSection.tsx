import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminLatestSeller, AdminUserCounts } from '../types/adminDashboard';
import { formatAdminCount } from '../utils/adminDashboardDisplay';
import {
  buildEngagementSegments,
  sumEngagementSegments,
} from '../utils/adminEngagementBreakdown';
import { countNewSignupsThisWeek } from '../utils/adminEngagementChart';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';
import { AdminSectionTitle } from './AdminSectionTitle';

export interface AdminUserEngagementSectionProps {
  userCounts: AdminUserCounts | null;
  latestSellers: AdminLatestSeller[];
  error?: string;
  onRetry?: () => void;
}

function EngagementBreakdown({ userCounts }: { userCounts: AdminUserCounts | null }) {
  const segments = buildEngagementSegments(userCounts);
  const total = sumEngagementSegments(segments);
  const visibleSegments = segments.filter((segment) => segment.value > 0);

  return (
    <View style={styles.breakdown}>
      <AppText variant="bodySmall" color="textSecondary">
        Who is registered on the platform
      </AppText>

      <View
        accessibilityRole="image"
        accessibilityLabel={`Registration breakdown: ${segments
          .map((segment) => `${segment.label} ${segment.value}`)
          .join(', ')}`}
        style={styles.stackedBarTrack}
      >
        {total === 0 ? (
          <View style={styles.stackedBarEmpty} />
        ) : (
          visibleSegments.map((segment, index) => (
            <View
              key={segment.key}
              style={[
                styles.stackedBarSegment,
                {
                  flex: segment.value,
                  backgroundColor: segment.color,
                  borderTopLeftRadius: index === 0 ? radius.medium : 0,
                  borderBottomLeftRadius: index === 0 ? radius.medium : 0,
                  borderTopRightRadius: index === visibleSegments.length - 1 ? radius.medium : 0,
                  borderBottomRightRadius: index === visibleSegments.length - 1 ? radius.medium : 0,
                },
              ]}
            />
          ))
        )}
      </View>

      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.key} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <AppText variant="bodySmall" color="textSecondary" style={styles.legendLabel}>
              {segment.label}
            </AppText>
            <AppText variant="bodyMedium" style={styles.legendValue}>
              {formatAdminCount(segment.value)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function EngagementStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statIconWrap, { backgroundColor: adminDashboardTheme.kpiIconBackground }]}>
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
  error,
  onRetry,
}: AdminUserEngagementSectionProps) {
  const newSignups = countNewSignupsThisWeek(latestSellers);

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="User Engagement" showIcon={false} />

      <View style={styles.card}>
        <View style={styles.content}>
          <EngagementBreakdown userCounts={userCounts} />

          <View style={styles.statsDivider} />

          <EngagementStat
            label="New seller signups this week"
            value={formatAdminCount(newSignups)}
            icon="person-add-outline"
          />
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
  breakdown: {
    gap: spacing.md,
  },
  stackedBarTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: adminDashboardTheme.chartTrackBackground,
  },
  stackedBarEmpty: {
    flex: 1,
    backgroundColor: colors.surfaceGrey,
  },
  stackedBarSegment: {
    minWidth: 4,
    height: '100%',
  },
  legend: {
    gap: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    flexShrink: 0,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
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
