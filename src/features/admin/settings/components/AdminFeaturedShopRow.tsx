import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { AdminFeaturedShopSeller } from '../types/adminSettings';
import { formatAdminFeaturedShopDisplayName } from '../utils/adminSettingsDisplay';
import { getAdminFeaturedShopSellerId } from '../utils/adminSettingsContent';

export interface AdminFeaturedShopRowProps {
  shop: AdminFeaturedShopSeller;
  index: number;
  total: number;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function ActionButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, disabled && styles.actionDisabled, pressed && !disabled && styles.pressed]}
    >
      <AppText variant="caption" color={disabled ? 'textMuted' : 'textLink'}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function AdminFeaturedShopRow({
  shop,
  index,
  total,
  disabled = false,
  onMoveUp,
  onMoveDown,
  onRemove,
}: AdminFeaturedShopRowProps) {
  const shopId = getAdminFeaturedShopSellerId(shop);

  return (
    <View style={styles.card}>
      <View style={styles.accent} />

      <View style={styles.body}>
        <View style={styles.header}>
          <AppText variant="caption" color="textMuted">
            #{index + 1}
          </AppText>
          <AppText variant="bodyMedium" style={styles.name} numberOfLines={2}>
            {formatAdminFeaturedShopDisplayName(shop, index)}
          </AppText>
        </View>

        {shop.email ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {shop.email}
          </AppText>
        ) : null}

        <View style={styles.actions}>
          <ActionButton label="Up" onPress={onMoveUp} disabled={disabled || index === 0} />
          <ActionButton label="Down" onPress={onMoveDown} disabled={disabled || index >= total - 1} />
          <ActionButton label="Remove" onPress={onRemove} disabled={disabled || !shopId} />
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
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    width: 4,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionButton: {
    paddingVertical: spacing.xs,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
