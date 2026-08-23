import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { EmptyState, ErrorState, Skeleton } from '../../../components/ecommerce';
import { colors, radius, screenPaddingHorizontal, shadows, spacing } from '../../../design-system';
import type { Seller } from '../../../services/types/seller';

interface HomeFeaturedSellersSectionProps {
  sellers: Seller[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSellerPress?: (seller: Seller) => void;
}

function getSellerDisplayName(seller: Seller): string {
  if (seller.storeTitle?.trim()) {
    return seller.storeTitle.trim();
  }

  const fullName = [seller.firstName, seller.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Featured seller';
}

function getSellerImageUrl(seller: Seller): string | undefined {
  return seller.storeBanner || seller.userProfile || seller.storeLogo;
}

function SellerCard({
  seller,
  onPress,
}: {
  seller: Seller;
  onPress?: () => void;
}) {
  const imageUrl = getSellerImageUrl(seller);
  const displayName = getSellerDisplayName(seller);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Visit ${displayName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <AppText variant="h3" color="primary">
              {displayName.charAt(0).toUpperCase()}
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <AppText variant="label" numberOfLines={2}>
          {displayName}
        </AppText>
        {seller.storeDesc ? (
          <AppText variant="caption" color="textMuted" numberOfLines={2}>
            {seller.storeDesc}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function HomeFeaturedSellersSection({
  sellers,
  isLoading,
  error,
  onRetry,
  onSellerPress,
}: HomeFeaturedSellersSectionProps) {
  if (isLoading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={`seller-skeleton-${index}`}
            variant="rect"
            width={168}
            height={210}
            style={styles.skeletonCard}
          />
        ))}
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onAction={() => void onRetry()} style={styles.statePanel} />
    );
  }

  if (sellers.length === 0) {
    return (
      <EmptyState
        title="Featured sellers coming soon"
        message="Check back for spotlight shops from our marketplace."
        style={styles.statePanel}
      />
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      decelerationRate="fast"
    >
      {sellers.map((seller) => (
        <SellerCard
          key={seller._id ?? seller.storeSlug ?? getSellerDisplayName(seller)}
          seller={seller}
          onPress={onSellerPress ? () => onSellerPress(seller) : undefined}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: screenPaddingHorizontal,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  card: {
    width: 168,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 90,
  },
  skeletonCard: {
    borderRadius: radius.large,
  },
  statePanel: {
    marginHorizontal: screenPaddingHorizontal,
  },
});
