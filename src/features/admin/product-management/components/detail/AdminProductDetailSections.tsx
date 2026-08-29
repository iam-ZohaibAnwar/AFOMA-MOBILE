import { Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppCard } from '../../../../../components/ui/AppCard';
import { AppText } from '../../../../../components/ui/AppText';
import type { Product } from '../../../../../services/types/product';
import { colors, radius, spacing } from '../../../../../design-system';
import { productImagesFromProduct } from '../../../../seller/products/api/sellerProductsApi';
import {
  AdminProductDetailFieldList,
  AdminProductDetailRow,
  AdminProductDetailSection,
} from './AdminProductDetailPrimitives';
import {
  buildAdminVariationDisplayRows,
  formatAdminProductDescription,
  getAdminProductApprovalFields,
  getAdminProductCategoryPath,
  getAdminProductDownloadInfo,
  getAdminProductPricingFields,
  getAdminProductSeoFields,
  getAdminProductShippingFields,
} from '../../utils/adminProductDetailDisplay';
import {
  getAdminProductSellerName,
  getAdminProductSellerUuid,
} from '../../utils/adminProductDisplay';

function openExternalUrl(url?: string) {
  if (!url?.trim()) {
    return;
  }

  void Linking.openURL(url.trim());
}

export function AdminProductSummarySection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Summary">
      <AppCard>
        <AdminProductDetailRow label="Product type" value={product.productType?.trim() || '—'} />
        {product.sku?.trim() ? <AdminProductDetailRow label="SKU" value={product.sku.trim()} /> : null}
        <AdminProductDetailRow
          label="Description"
          value={formatAdminProductDescription(product)}
          multiline
        />
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductSellerSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Seller">
      <AppCard>
        <AdminProductDetailRow label="Seller name" value={getAdminProductSellerName(product)} />
        <AdminProductDetailRow label="Seller ID" value={getAdminProductSellerUuid(product)} />
        {product.seller?.storeTitle?.trim() ? (
          <AdminProductDetailRow label="Shop name" value={product.seller.storeTitle.trim()} />
        ) : null}
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductApprovalSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Approval + visibility">
      <AppCard>
        <AdminProductDetailFieldList fields={getAdminProductApprovalFields(product)} />
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductCategoriesSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Categories">
      <AppCard>
        <AdminProductDetailRow label="Category path" value={getAdminProductCategoryPath(product)} />
        {product.Category?.name?.trim() ? (
          <AdminProductDetailRow label="Parent" value={product.Category.name.trim()} />
        ) : null}
        {product.SubCategory?.name?.trim() ? (
          <AdminProductDetailRow label="Subcategory" value={product.SubCategory.name.trim()} />
        ) : null}
        {product.childCategory?.name?.trim() ? (
          <AdminProductDetailRow label="Child category" value={product.childCategory.name.trim()} />
        ) : null}
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductPricingSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Pricing">
      <AppCard>
        <AdminProductDetailFieldList fields={getAdminProductPricingFields(product)} />
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductMediaSection({ product }: { product: Product }) {
  const images = productImagesFromProduct(product);
  const videos = product.videos ?? [];

  return (
    <AdminProductDetailSection title="Media">
      <AppCard style={styles.mediaCard}>
        {images.length > 0 ? (
          <>
            <AppText variant="bodyMedium" style={styles.mediaHeading}>
              Images ({images.length})
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageStrip}>
              {images.map((image, index) => (
                <View key={`${image.fileName ?? 'image'}-${index}`} style={styles.imageTile}>
                  {image.imageUrl ? (
                    <Image source={{ uri: image.imageUrl }} style={styles.image} resizeMode="contain" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <AppText variant="caption" color="textMuted">
                        No preview
                      </AppText>
                    </View>
                  )}
                  {image.altText?.trim() ? (
                    <AppText variant="caption" color="textSecondary" numberOfLines={2}>
                      {image.altText.trim()}
                    </AppText>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No images uploaded.
          </AppText>
        )}

        {videos.length > 0 ? (
          <View style={styles.videoBlock}>
            <AppText variant="bodyMedium" style={styles.mediaHeading}>
              Videos ({videos.length})
            </AppText>
            {videos.map((video, index) => (
              <Pressable
                key={`video-${index}`}
                accessibilityRole="link"
                onPress={() => openExternalUrl(video.videoUrl)}
                style={({ pressed }) => [styles.videoRow, pressed && styles.videoRowPressed]}
              >
                <AppText variant="bodySmall" color="textLink" numberOfLines={2}>
                  {video.videoUrl?.trim() || `Video ${index + 1}`}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductShippingSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="Shipping">
      <AppCard>
        <AdminProductDetailFieldList fields={getAdminProductShippingFields(product)} />
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductDownloadSection({ product }: { product: Product }) {
  const download = getAdminProductDownloadInfo(product);

  return (
    <AdminProductDetailSection title="Download">
      <AppCard style={styles.downloadCard}>
        {download ? (
          <>
            <AdminProductDetailRow label="File name" value={download.fileName} />
            {download.fileUrl ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => openExternalUrl(download.fileUrl)}
                style={({ pressed }) => [styles.downloadLink, pressed && styles.downloadLinkPressed]}
              >
                <AppText variant="bodySmall" color="textLink" numberOfLines={3}>
                  {download.fileUrl}
                </AppText>
              </Pressable>
            ) : (
              <AppText variant="bodySmall" color="textMuted">
                Download URL not available.
              </AppText>
            )}
          </>
        ) : (
          <AppText variant="bodySmall" color="textMuted">
            No downloadable file attached.
          </AppText>
        )}
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductSeoSection({ product }: { product: Product }) {
  return (
    <AdminProductDetailSection title="SEO">
      <AppCard>
        <AdminProductDetailFieldList
          fields={getAdminProductSeoFields(product).map((field) => ({
            ...field,
            multiline: field.label === 'Meta description' || field.label.includes('URL'),
          }))}
        />
      </AppCard>
    </AdminProductDetailSection>
  );
}

export function AdminProductVariationsSection({ product }: { product: Product }) {
  const rows = buildAdminVariationDisplayRows(product);

  return (
    <AdminProductDetailSection title="Variations">
      <View style={styles.variationList}>
        {rows.map((row) => (
          <AppCard key={row.id} style={styles.variationCard}>
            <AppText variant="bodyMedium" style={styles.variationTitle}>
              {row.title}
            </AppText>

            {row.imageUrl ? (
              <View style={styles.variationImageWrap}>
                <Image source={{ uri: row.imageUrl }} style={styles.variationImage} resizeMode="contain" />
              </View>
            ) : null}

            {row.attributes.length > 0 ? (
              <View style={styles.variationGroup}>
                <AppText variant="caption" color="textSecondary">
                  Options
                </AppText>
                <AdminProductDetailFieldList fields={row.attributes} />
              </View>
            ) : null}

            <View style={styles.variationGroup}>
              <AppText variant="caption" color="textSecondary">
                Inventory & pricing
              </AppText>
              <AdminProductDetailFieldList fields={row.fields} />
            </View>
          </AppCard>
        ))}
      </View>
    </AdminProductDetailSection>
  );
}

const styles = StyleSheet.create({
  mediaCard: {
    gap: spacing.md,
  },
  mediaHeading: {
    fontWeight: '600',
  },
  imageStrip: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  imageTile: {
    width: 120,
    gap: spacing.xs,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  videoBlock: {
    gap: spacing.sm,
  },
  videoRow: {
    paddingVertical: spacing.xs,
  },
  videoRowPressed: {
    opacity: 0.85,
  },
  downloadCard: {
    gap: spacing.sm,
  },
  downloadLink: {
    paddingVertical: spacing.xs,
  },
  downloadLinkPressed: {
    opacity: 0.85,
  },
  variationList: {
    gap: spacing.md,
  },
  variationCard: {
    gap: spacing.sm,
  },
  variationTitle: {
    fontWeight: '700',
  },
  variationImageWrap: {
    width: '100%',
    height: 200,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  variationImage: {
    width: '100%',
    height: '100%',
  },
  variationGroup: {
    gap: spacing.xs,
  },
});
