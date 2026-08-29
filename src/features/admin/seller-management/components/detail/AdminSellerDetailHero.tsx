import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import { AdminProductStatusChip } from '../../../product-management/components/AdminProductStatusChip';
import type { AdminSellerListItem } from '../../types/adminSellerManagement';
import {
  getAdminSellerDisplayName,
  resolveAdminSellerListStatusChips,
} from '../../utils/adminSellerDisplay';

const HERO_HEIGHT_RATIO = 0.28;

function resolveSellerBannerUrl(seller: AdminSellerListItem): string | undefined {
  return seller.storeBanner?.trim() || undefined;
}

function resolveSellerAvatarUrl(seller: AdminSellerListItem): string | undefined {
  return seller.storeLogo?.trim() || seller.userProfile?.trim() || undefined;
}

export interface AdminSellerDetailHeroProps {
  seller: AdminSellerListItem;
  isRefreshing?: boolean;
  error?: string | null;
}

export function AdminSellerDetailHero({ seller, isRefreshing, error }: AdminSellerDetailHeroProps) {
  const { width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.round(windowWidth * HERO_HEIGHT_RATIO);
  const bannerUrl = resolveSellerBannerUrl(seller);
  const avatarUrl = resolveSellerAvatarUrl(seller);
  const displayName = getAdminSellerDisplayName(seller);
  const shopTitle = seller.storeTitle?.trim();
  const statusChips = resolveAdminSellerListStatusChips(seller);

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { height: heroHeight }]}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="storefront-outline" size={36} color={colors.textInverse} />
          </View>
        )}
      </View>

      <View style={styles.summary}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={22} color={colors.textInverse} />
              </View>
            )}
          </View>

          <View style={styles.profileCopy}>
            <AppText variant="h3" style={styles.name}>
              {displayName}
            </AppText>
            {shopTitle ? (
              <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
                {shopTitle}
              </AppText>
            ) : null}
            {seller.email?.trim() ? (
              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                {seller.email.trim()}
              </AppText>
            ) : null}
          </View>
        </View>

        {statusChips.length > 0 ? (
          <View style={styles.chipRow}>
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

        {seller.uuid ? (
          <AppText variant="caption" color="textMuted">
            Seller ID: {seller.uuid}
          </AppText>
        ) : null}

        {isRefreshing ? (
          <AppText variant="caption" color="textSecondary">
            Refreshing…
          </AppText>
        ) : null}

        {error ? (
          <AppText variant="bodySmall" color="textLink">
            {error}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -spacing.lg,
  },
  hero: {
    backgroundColor: colors.surfaceMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: -32,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.surfaceMuted,
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingTop: spacing.xs,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
