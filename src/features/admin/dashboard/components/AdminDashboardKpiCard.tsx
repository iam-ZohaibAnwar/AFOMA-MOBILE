import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface AdminDashboardKpiCardProps {
  label: string;
  value: string;
  restricted?: boolean;
}

export function AdminDashboardKpiCard({ label, value, restricted }: AdminDashboardKpiCardProps) {
  return (
    <View style={styles.card}>
      <AppText variant="caption" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.value} numberOfLines={1}>
        {value}
      </AppText>
      {restricted ? (
        <AppText variant="caption" color="textMuted">
          Restricted
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 96,
    backgroundColor: colors.secondaryMuted,
    borderRadius: radius.medium,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  label: {
    fontWeight: '600',
  },
  value: {
    color: colors.primary,
    fontWeight: '700',
  },
});
