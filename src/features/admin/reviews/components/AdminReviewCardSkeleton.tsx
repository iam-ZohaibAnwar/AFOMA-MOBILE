import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../../components/ecommerce';
import { colors, radius, shadows, spacing } from '../../../../design-system';

export function AdminReviewCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Skeleton variant="rect" width={44} height={44} style={styles.avatar} />
        <View style={styles.content}>
          <Skeleton variant="text" height={16} width="72%" />
          <Skeleton variant="text" height={12} width="48%" />
          <Skeleton variant="rect" width={88} height={22} style={styles.badge} />
        </View>
        <Skeleton variant="rect" width={18} height={18} style={styles.menuDot} />
      </View>
      <Skeleton variant="text" height={14} width="90%" />
      <Skeleton variant="text" height={12} width="100%" />
      <Skeleton variant="text" height={12} width="84%" />
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
    gap: spacing.md,
  },
  avatar: {
    borderRadius: radius.medium,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radius.pill,
  },
  menuDot: {
    borderRadius: radius.pill,
  },
});
