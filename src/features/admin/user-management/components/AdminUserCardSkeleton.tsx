import { StyleSheet, View } from 'react-native';

import { Skeleton } from '../../../../components/ecommerce';
import { colors, radius, shadows, spacing } from '../../../../design-system';

const AVATAR_SIZE = 80;

export function AdminUserCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <Skeleton variant="rect" width={AVATAR_SIZE} height={AVATAR_SIZE} style={styles.avatar} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Skeleton variant="text" width="78%" height={16} />
            <Skeleton variant="rect" width={18} height={18} style={styles.menuDot} />
          </View>
          <Skeleton variant="text" width="62%" height={12} />
          <View style={styles.footer}>
            <Skeleton variant="text" width={96} height={12} />
            <Skeleton variant="rect" width={88} height={22} style={styles.badge} />
          </View>
        </View>
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
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.borderStrong,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.md + 4,
    minHeight: AVATAR_SIZE + spacing.md * 2,
  },
  avatar: {
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  menuDot: {
    borderRadius: radius.pill,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  badge: {
    borderRadius: radius.pill,
  },
});
