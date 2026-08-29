import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../../components/ecommerce';
import { colors, radius, shadows, spacing } from '../../../../design-system';

export function AdminSettingsHubCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Skeleton variant="rect" width={44} height={44} style={styles.icon} />
        <View style={styles.copy}>
          <Skeleton variant="text" height={16} width="62%" />
          <Skeleton variant="text" height={12} width="88%" />
          <Skeleton variant="rect" width={96} height={22} style={styles.badge} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    width: 4,
    backgroundColor: colors.border,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
  },
  icon: {
    borderRadius: radius.medium,
    flexShrink: 0,
    marginTop: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radius.pill,
  },
});
