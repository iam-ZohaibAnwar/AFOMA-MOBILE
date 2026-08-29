import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import {
  getAdminSellerDisplayName,
  getAdminSellerListSubtitle,
  isAdminSellerShopVisible,
  resolveAdminSellerAccentColor,
  resolveAdminSellerListStatusChips,
} from '../utils/adminSellerDisplay';

export interface AdminSellerCardProps {
  seller: AdminSellerListItem;
  onPress: (seller: AdminSellerListItem) => void;
  onMenuPress: (seller: AdminSellerListItem) => void;
  isBusy?: boolean;
}

function resolveSellerAvatarUrl(seller: AdminSellerListItem): string | undefined {
  return seller.storeLogo?.trim() || seller.userProfile?.trim() || undefined;
}

export function AdminSellerCard({
  seller,
  onPress,
  onMenuPress,
  isBusy = false,
}: AdminSellerCardProps) {
  const sellerId = seller._id;
  const dimmed = !isAdminSellerShopVisible(seller);
  const avatarUrl = resolveSellerAvatarUrl(seller);
  const accentColor = resolveAdminSellerAccentColor(seller);
  const subtitle = getAdminSellerListSubtitle(seller);
  const statusChips = resolveAdminSellerListStatusChips(seller);
  const shopTitle = seller.storeTitle?.trim();

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        disabled={!sellerId || isBusy}
        onPress={() => onPress(seller)}
        style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
      >
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatar, dimmed && styles.avatarDimmed]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="storefront-outline" size={24} color={colors.textInverse} />
            </View>
          )}

          {dimmed ? (
            <View style={styles.avatarOverlay}>
              <Ionicons name="eye-off-outline" size={18} color={colors.textInverse} />
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <AppText
            variant="bodyMedium"
            style={[styles.name, dimmed && styles.nameDimmed]}
            numberOfLines={1}
          >
            {getAdminSellerDisplayName(seller)}
          </AppText>

          <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </AppText>

          <View style={styles.footerRow}>
            {shopTitle ? (
              <AppText variant="bodySmall" style={[styles.shopLabel, dimmed && styles.shopLabelDimmed]} numberOfLines={1}>
                {shopTitle}
              </AppText>
            ) : seller.uuid ? (
              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                {seller.uuid}
              </AppText>
            ) : null}

            {statusChips.length > 0 ? (
              <View style={styles.chipsRow}>
                {statusChips.map((chip) => (
                  <AdminProductStatusChip
                    key={chip.id}
                    label={chip.label}
                    icon={chip.icon as keyof typeof Ionicons.glyphMap}
                    tone={chip.tone}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Seller actions"
        disabled={!sellerId || isBusy}
        onPress={() => onMenuPress(seller)}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
        hitSlop={8}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        )}
      </Pressable>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
    position: 'relative',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingRight: spacing.md + 28,
    paddingLeft: spacing.md + 4,
    minHeight: AVATAR_SIZE + spacing.md * 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarDimmed: {
    opacity: 0.45,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    paddingRight: spacing.xs,
  },
  nameDimmed: {
    color: colors.textMuted,
  },
  subtitle: {
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  shopLabel: {
    color: colors.primary,
    fontWeight: '700',
    flexShrink: 1,
  },
  shopLabelDimmed: {
    color: colors.textMuted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },
  menuButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.sm,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
});
