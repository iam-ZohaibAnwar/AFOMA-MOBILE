import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../../components/ecommerce';
import { colors, radius, shadows, spacing } from '../../../../design-system';

export function AdminCommissionCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerMeta}>
          <Skeleton variant="text" height={12} width="42%" />
          <Skeleton variant="text" height={12} width="28%" />
        </View>
        <Skeleton variant="rect" width={72} height={22} style={styles.badge} />
      </View>
      <Skeleton variant="text" height={14} width="68%" />
      <View style={styles.thumbs}>
        <Skeleton variant="rect" width={52} height={52} />
        <Skeleton variant="rect" width={52} height={52} />
      </View>
      <View style={styles.footerRow}>
        <Skeleton variant="text" height={24} width="38%" />
        <Skeleton variant="rect" width={20} height={20} style={styles.chevron} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radius.pill,
  },
  thumbs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chevron: {
    borderRadius: radius.pill,
  },
});
