import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppBadge } from '../../../../components/ui/AppBadge';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import {
  approvalStatusBadgeVariant,
  formatAdminSellerApprovalStatus,
  getAdminSellerDisplayName,
  getAdminSellerShopVisibilityLabel,
  isAdminSellerShopVisible,
  shopVisibilityBadgeVariant,
} from '../utils/adminSellerDisplay';

export interface AdminSellerCardProps {
  seller: AdminSellerListItem;
  isUpdatingVisibility: boolean;
  isDeleting: boolean;
  onPress: (seller: AdminSellerListItem) => void;
  onVisibilityChange: (seller: AdminSellerListItem, nextVisible: boolean) => void;
  onDeletePress: (seller: AdminSellerListItem) => void;
}

export function AdminSellerCard({
  seller,
  isUpdatingVisibility,
  isDeleting,
  onPress,
  onVisibilityChange,
  onDeletePress,
}: AdminSellerCardProps) {
  const sellerId = seller._id;
  const isVisible = isAdminSellerShopVisible(seller);
  const actionsDisabled = isUpdatingVisibility || isDeleting;

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        disabled={!sellerId}
        onPress={() => onPress(seller)}
        style={({ pressed }) => [styles.mainPressable, pressed && styles.pressed]}
      >
        <View style={styles.identityRow}>
          <View style={styles.identityCopy}>
            <AppText variant="bodyMedium" style={styles.name}>
              {getAdminSellerDisplayName(seller)}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {seller.email ?? 'No email'}
            </AppText>
          </View>

          {seller.uuid ? (
            <AppText variant="caption" color="textMuted">
              {seller.uuid}
            </AppText>
          ) : null}
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.badgeGroup}>
            <AppText variant="caption" color="textMuted">
              Approval
            </AppText>
            <AppBadge
              label={formatAdminSellerApprovalStatus(seller.status)}
              variant={approvalStatusBadgeVariant(seller.status)}
            />
          </View>

          <View style={styles.badgeGroup}>
            <AppText variant="caption" color="textMuted">
              Shop
            </AppText>
            <AppBadge
              label={getAdminSellerShopVisibilityLabel(seller)}
              variant={shopVisibilityBadgeVariant(seller)}
            />
          </View>
        </View>
      </Pressable>

      <View style={styles.actionsRow}>
        <View style={styles.visibilityControl}>
          <AppText variant="bodySmall" color="textSecondary">
            Shop visibility
          </AppText>
          {isUpdatingVisibility ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={isVisible}
              disabled={actionsDisabled || !sellerId}
              onValueChange={(nextVisible) => onVisibilityChange(seller, nextVisible)}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={actionsDisabled || !sellerId}
          onPress={() => onDeletePress(seller)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed, actionsDisabled && styles.disabled]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <AppText variant="bodySmall" style={styles.deleteLabel}>
              Delete
            </AppText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  mainPressable: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  identityRow: {
    gap: spacing.xs,
  },
  identityCopy: {
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  badgeGroup: {
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  visibilityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  deleteButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
});
