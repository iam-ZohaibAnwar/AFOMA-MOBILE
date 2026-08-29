import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { spacing } from '../../../../design-system';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';

export interface AdminDashboardKpiCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  restricted?: boolean;
}

export function AdminDashboardKpiCard({
  label,
  value,
  icon,
  restricted,
}: AdminDashboardKpiCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={adminDashboardTheme.kpiIconColor} />
      </View>

      <AppText variant="bodySmall" color="textSecondary" style={styles.label}>
        {label}
      </AppText>

      <AppText variant="h2" style={styles.value} numberOfLines={1}>
        {value}
      </AppText>

      {restricted ? (
        <AppText variant="caption" color="textMuted">
          Full admin access required
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: adminDashboardTheme.cardBackground,
    borderRadius: adminDashboardTheme.cardRadius,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: adminDashboardTheme.cardBorder,
    ...adminDashboardTheme.cardShadow,
  },
  iconWrap: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminDashboardTheme.kpiIconBackground,
  },
  label: {
    fontWeight: '600',
    paddingRight: 48,
  },
  value: {
    color: adminDashboardTheme.kpiValueColor,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
  },
});
