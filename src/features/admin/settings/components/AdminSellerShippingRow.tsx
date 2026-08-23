import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';
import { getAdminSellerDisplayName } from '../../seller-management/utils/adminSellerDisplay';

export interface AdminSellerShippingRowProps {
  seller: AdminSellerListItem;
  onPress: () => void;
}

export function AdminSellerShippingRow({ seller, onPress }: AdminSellerShippingRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.title}>
          {getAdminSellerDisplayName(seller)}
        </AppText>
        {seller.email ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {seller.email}
          </AppText>
        ) : null}
        {seller.country ? (
          <AppText variant="caption" color="textMuted">
            {seller.country}
          </AppText>
        ) : null}
      </View>
      <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.88,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
});
