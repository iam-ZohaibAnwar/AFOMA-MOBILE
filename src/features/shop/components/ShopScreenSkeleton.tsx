import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../components/ecommerce';
import { colors, spacing } from '../../../design-system';
import { ProductGridSkeleton } from '../../products/components/ProductGridSkeleton';

export function ShopScreenSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton variant="rect" height={160} />
      <View style={styles.profileRow}>
        <Skeleton variant="circle" width={72} height={72} />
        <View style={styles.profileText}>
          <Skeleton variant="text" height={22} width="70%" />
          <Skeleton variant="text" height={14} width="45%" />
        </View>
      </View>
      <View style={styles.statsRow}>
        <Skeleton variant="rect" height={72} style={styles.statCard} />
        <Skeleton variant="rect" height={72} style={styles.statCard} />
      </View>
      <View style={styles.tabsRow}>
        <Skeleton variant="rect" height={40} style={styles.tab} />
        <Skeleton variant="rect" height={40} style={styles.tab} />
        <Skeleton variant="rect" height={40} style={styles.tab} />
      </View>
      <ProductGridSkeleton count={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: -28,
  },
  profileText: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    flex: 1,
    borderRadius: 999,
  },
});
