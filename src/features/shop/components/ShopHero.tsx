import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { AppText } from '../../../components/ui/AppText';
import { Skeleton } from '../../../components/ecommerce';
import { colors, radius, spacing } from '../../../design-system';
import type { Seller } from '../../../services/types/seller';
import {
  getSellerAvatarUrl,
  getSellerBannerUrl,
  getSellerInitials,
  getSellerStoreTitle,
} from '../utils/sellerDisplay';

export interface ShopHeroProps {
  seller: Seller;
  productCount?: number;
  averageRating?: number;
  reviewCount?: number;
  isReviewsLoading?: boolean;
  isProductsLoading?: boolean;
  onBack?: () => void;
  onReadMoreAbout?: () => void;
}

export function ShopHero({
  seller,
  productCount = 0,
  averageRating,
  reviewCount = 0,
  isReviewsLoading = false,
  isProductsLoading = false,
  onBack,
  onReadMoreAbout,
}: ShopHeroProps) {
  const insets = useSafeAreaInsets();
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const bannerUrl = getSellerBannerUrl(seller);
  const avatarUrl = getSellerAvatarUrl(seller);
  const title = getSellerStoreTitle(seller);
  const hasReviews = Boolean(averageRating && reviewCount > 0);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        {onBack ? (
          <HeaderBackButton onPress={onBack} color={colors.textPrimary} />
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <AppText variant="bodyMedium" style={styles.topBarTitle} numberOfLines={1}>
          {title}
        </AppText>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.bannerWrap}>
        {bannerUrl ? (
          <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}

        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppText variant="label" color="primary">
                {getSellerInitials(seller)}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.info}>
        <AppText variant="h3" style={styles.title} numberOfLines={2}>
          {title}
        </AppText>

        <View style={styles.statsRow}>
          {isReviewsLoading ? (
            <Skeleton variant="text" height={14} width={120} />
          ) : hasReviews ? (
            <AppText variant="bodySmall" color="textSecondary">
              <Text style={styles.starGlyph}>★ </Text>
              {averageRating?.toFixed(1)} ({reviewCount} review{reviewCount === 1 ? '' : 's'})
            </AppText>
          ) : (
            <AppText variant="bodySmall" color="textMuted">
              No reviews yet
            </AppText>
          )}

          <AppText variant="bodySmall" color="textMuted" style={styles.statDot}>
            ·
          </AppText>

          {isProductsLoading ? (
            <Skeleton variant="text" height={14} width={80} />
          ) : (
            <AppText variant="bodySmall" color="textSecondary">
              {productCount} product{productCount === 1 ? '' : 's'}
            </AppText>
          )}
        </View>

        {seller.storeDesc ? (
          <View style={styles.descriptionBlock}>
            <AppText
              variant="bodySmall"
              color="textSecondary"
              style={styles.description}
              numberOfLines={3}
              onTextLayout={(event) => {
                setIsDescriptionTruncated(event.nativeEvent.lines.length >= 3);
              }}
            >
              {seller.storeDesc}
            </AppText>
            {isDescriptionTruncated && onReadMoreAbout ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Read full shop description in About"
                onPress={onReadMoreAbout}
                hitSlop={8}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AppText variant="bodySmall" style={styles.readMore}>
                  Read more
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const AVATAR_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  topBarTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  topBarSpacer: {
    width: 40,
  },
  backPlaceholder: {
    width: 44,
    height: 44,
  },
  bannerWrap: {
    height: 168,
    backgroundColor: colors.primarySoft,
    marginBottom: AVATAR_SIZE / 2 + spacing.sm,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  avatarWrap: {
    position: 'absolute',
    left: spacing.lg,
    bottom: -(AVATAR_SIZE / 2),
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: colors.background,
    overflow: 'hidden',
    backgroundColor: colors.surfaceWhite,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  info: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDot: {
    marginHorizontal: spacing.xs,
  },
  starGlyph: {
    color: colors.warning,
    fontWeight: '700',
  },
  descriptionBlock: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  description: {
    lineHeight: 20,
  },
  readMore: {
    color: colors.textLink,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
