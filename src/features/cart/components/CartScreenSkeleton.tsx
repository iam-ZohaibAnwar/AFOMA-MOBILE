import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../components/ecommerce';
import { colors, spacing } from '../../../design-system';

export function CartScreenSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton variant="circle" width={36} height={36} />
        <Skeleton variant="text" width={120} height={22} />
        <Skeleton variant="circle" width={36} height={36} />
      </View>

      {Array.from({ length: 2 }).map((_, index) => (
        <View key={`cart-line-skeleton-${index}`} style={styles.lineItem}>
          <Skeleton variant="rect" width={88} height={88} style={styles.thumb} />
          <View style={styles.lineDetails}>
            <Skeleton variant="text" height={16} />
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width="40%" height={18} />
          </View>
        </View>
      ))}

      <View style={styles.summary}>
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="rect" height={52} style={styles.checkoutButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  thumb: {
    borderRadius: 12,
  },
  lineDetails: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  summary: {
    marginTop: 'auto',
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  checkoutButton: {
    marginTop: spacing.md,
    borderRadius: 999,
  },
});
