import { Alert, Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';
import type { Product } from '../../../../../services/types/product';
import { getProductImageUrl } from '../../../../products/utils/productDisplay';
import { promptProductShare } from '../../../../products/utils/shareProduct';
import { getProductShareUrl } from '../../../../products/utils/productShare';
import type { AdminStackParamList } from '../../../navigation/adminTypes';
import { AdminProductStatusChip } from '../AdminProductStatusChip';
import { getAdminProductSkuLabel } from '../../utils/adminProductDisplay';
import {
  formatAdminProductSummaryPrice,
  resolveAdminProductDetailStatusChips,
} from '../../utils/adminProductDetailDisplay';
import {
  canAdminPreviewProductInApp,
  navigateToAdminProductMobilePreview,
} from '../../utils/adminProductPreviewNavigation';

const HERO_ASPECT_RATIO = 1;

export interface AdminProductDetailHeroProps {
  product: Product;
  isRefreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AdminProductDetailHero({
  product,
  isRefreshing,
  error,
  onRetry,
}: AdminProductDetailHeroProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const imageUrl = getProductImageUrl(product);
  const priceLabel = formatAdminProductSummaryPrice(product);
  const sku = getAdminProductSkuLabel(product);
  const statusChips = resolveAdminProductDetailStatusChips(product);
  const canPreview = canAdminPreviewProductInApp(product);

  const handleSharePress = () => {
    const url = getProductShareUrl(product.slug, product._id);
    if (!url) {
      Alert.alert('Share unavailable', 'This product does not have a shareable link yet.');
      return;
    }

    promptProductShare({
      title: product.productName?.trim() || 'Product',
      url,
    });
  };

  const handlePreviewPress = () => {
    if (!navigateToAdminProductMobilePreview(navigation, product)) {
      Alert.alert('Preview unavailable', 'This product cannot be opened in the mobile storefront yet.');
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { width: windowWidth, aspectRatio: HERO_ASPECT_RATIO }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="contain" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="image-outline" size={40} color={colors.textInverse} />
          </View>
        )}

        <View style={styles.heroActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share product"
            onPress={handleSharePress}
            style={({ pressed }) => [styles.heroActionButton, pressed && styles.heroActionPressed]}
          >
            <Ionicons name="share-outline" size={18} color={colors.textPrimary} />
          </Pressable>

          {canPreview ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Preview in storefront"
              onPress={handlePreviewPress}
              style={({ pressed }) => [styles.heroActionButton, pressed && styles.heroActionPressed]}
            >
              <Ionicons name="open-outline" size={18} color={colors.textPrimary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.titleRow}>
          <AppText variant="h3" style={styles.productName}>
            {product.productName?.trim() || 'Untitled product'}
          </AppText>

          <View style={styles.priceColumn}>
            <AppText variant="h3" style={styles.price}>
              {priceLabel}
            </AppText>
            {sku ? (
              <AppText variant="caption" color="textMuted" style={styles.sku}>
                SKU: {sku}
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

        {isRefreshing ? (
          <AppText variant="caption" color="textSecondary">
            Refreshing…
          </AppText>
        ) : null}

        {error && onRetry ? (
          <Pressable accessibilityRole="button" onPress={onRetry}>
            <AppText variant="bodySmall" color="textLink">
              Retry loading product
            </AppText>
          </Pressable>
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
    alignSelf: 'center',
    backgroundColor: colors.surfaceMuted,
    position: 'relative',
    overflow: 'hidden',
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
  heroActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
  },
  heroActionButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionPressed: {
    opacity: 0.88,
  },
  summary: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  productName: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '800',
    lineHeight: 26,
    fontSize: 20,
  },
  priceColumn: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 2,
  },
  price: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 20,
  },
  sku: {
    textAlign: 'right',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
