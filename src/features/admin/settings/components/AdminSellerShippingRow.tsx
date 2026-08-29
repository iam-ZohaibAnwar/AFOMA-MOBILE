import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronForwardIcon } from '../../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';
import {
  getAdminSellerDisplayName,
  getAdminSellerListSubtitle,
  resolveAdminSellerAccentColor,
} from '../../seller-management/utils/adminSellerDisplay';

export interface AdminSellerShippingRowProps {
  seller: AdminSellerListItem;
  onPress: () => void;
}

function resolveSellerAvatarUrl(seller: AdminSellerListItem): string | undefined {
  return seller.storeLogo?.trim() || seller.userProfile?.trim() || undefined;
}

export function AdminSellerShippingRow({ seller, onPress }: AdminSellerShippingRowProps) {
  const accentColor = resolveAdminSellerAccentColor(seller);
  const avatarUrl = resolveSellerAvatarUrl(seller);
  const subtitle = getAdminSellerListSubtitle(seller);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="storefront-outline" size={22} color={colors.textInverse} />
            </View>
          )}
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
            {getAdminSellerDisplayName(seller)}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
          {seller.country ? (
            <AppText variant="caption" color="textMuted">
              {seller.country}
            </AppText>
          ) : null}
        </View>

        <View style={styles.chevronWrap}>
          <ChevronForwardIcon color={colors.textMuted} size={18} />
        </View>
      </Pressable>
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
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  avatarWrap: {
    flexShrink: 0,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chevronWrap: {
    marginTop: spacing.lg,
  },
});
