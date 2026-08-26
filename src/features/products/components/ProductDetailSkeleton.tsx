import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Skeleton } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';

export function ProductDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.navRow}>
        <Skeleton variant="circle" width={40} height={40} />
        <View style={styles.navActions}>
          <Skeleton variant="circle" width={40} height={40} />
          <Skeleton variant="circle" width={40} height={40} />
        </View>
      </View>

      <Skeleton variant="rect" height={360} style={styles.heroImage} />

      <View style={styles.sheet}>
        <Skeleton variant="text" height={28} style={styles.titleLine} />
        <Skeleton variant="text" width="55%" height={16} />
        <View style={styles.priceRow}>
          <Skeleton variant="text" width="35%" height={24} />
          <Skeleton variant="rect" width={112} height={40} style={styles.stepper} />
        </View>
        <Skeleton variant="rect" height={44} style={styles.optionRow} />
        <Skeleton variant="rect" height={44} style={styles.optionRow} />
        <Skeleton variant="text" height={14} />
        <Skeleton variant="text" height={14} />
        <Skeleton variant="text" width="80%" height={14} />
      </View>

      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Skeleton variant="rect" height={52} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  navActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroImage: {
    borderRadius: 0,
  },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    flex: 1,
  },
  titleLine: {
    width: '88%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepper: {
    borderRadius: radius.pill,
  },
  optionRow: {
    borderRadius: radius.medium,
  },
  stickyBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cta: {
    borderRadius: radius.pill,
  },
});
