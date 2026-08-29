import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../../components/ui/AppText';
import type { Product } from '../../../../../services/types/product';
import { colors, radius, spacing } from '../../../../../design-system';
import { productImagesFromProduct } from '../../../../seller/products/api/sellerProductsApi';
import {
  AdminProductDetailChip,
  AdminProductDetailFieldList,
  AdminProductDetailRow,
} from './AdminProductDetailPrimitives';
import { AdminProductCollapsibleSection } from './AdminProductCollapsibleSection';
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

function SectionPreview({ text }: { text: string }) {
  return (
    <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.previewText}>
      {text}
    </AppText>
  );
}

export function AdminProductSummarySection({ product }: { product: Product }) {
  return (
    <AdminProductCollapsibleSection
      title="Summary"
      icon="document-text-outline"
      collapsedPreview={<SectionPreview text={product.productType?.trim() || 'Product'} />}
    >
      <AdminProductDetailRow label="Product type" value={product.productType?.trim() || '—'} />
      {product.sku?.trim() ? <AdminProductDetailRow label="SKU" value={product.sku.trim()} /> : null}
      <AdminProductDetailRow
        label="Description"
        value={formatAdminProductDescription(product)}
        multiline
      />
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductSellerSection({ product }: { product: Product }) {
  return (
    <AdminProductCollapsibleSection
      title="Seller"
      icon="storefront-outline"
      collapsedPreview={<SectionPreview text={getAdminProductSellerName(product)} />}
    >
      <AdminProductDetailRow label="Seller name" value={getAdminProductSellerName(product)} />
      <AdminProductDetailRow label="Seller ID" value={getAdminProductSellerUuid(product)} />
      {product.seller?.storeTitle?.trim() ? (
        <AdminProductDetailRow label="Shop name" value={product.seller.storeTitle.trim()} />
      ) : null}
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductApprovalSection({ product }: { product: Product }) {
  const approval = getAdminProductApprovalFields(product)[0]?.value ?? '—';

  return (
    <AdminProductCollapsibleSection
      title="Approval + visibility"
      icon="shield-checkmark-outline"
      collapsedPreview={<SectionPreview text={approval} />}
    >
      <AdminProductDetailFieldList fields={getAdminProductApprovalFields(product)} />
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductCategoriesSection({ product }: { product: Product }) {
  const path = getAdminProductCategoryPath(product);

  return (
    <AdminProductCollapsibleSection
      title="Categories"
      icon="folder-outline"
      collapsedPreview={<SectionPreview text={path} />}
    >
      <AdminProductDetailRow label="Category path" value={path} />
      {product.Category?.name?.trim() ? (
        <AdminProductDetailRow label="Parent" value={product.Category.name.trim()} />
      ) : null}
      {product.SubCategory?.name?.trim() ? (
        <AdminProductDetailRow label="Subcategory" value={product.SubCategory.name.trim()} />
      ) : null}
      {product.childCategory?.name?.trim() ? (
        <AdminProductDetailRow label="Child category" value={product.childCategory.name.trim()} />
      ) : null}
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductPricingSection({ product }: { product: Product }) {
  const price = getAdminProductPricingFields(product)[0]?.value ?? '—';

  return (
    <AdminProductCollapsibleSection
      title="Pricing"
      icon="pricetag-outline"
      collapsedPreview={<SectionPreview text={price} />}
    >
      <AdminProductDetailFieldList fields={getAdminProductPricingFields(product)} />
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductMediaSection({ product }: { product: Product }) {
  const images = productImagesFromProduct(product);
  const videos = product.videos ?? [];
  const preview =
    images.length > 0
      ? `${images.length} image${images.length === 1 ? '' : 's'}`
      : videos.length > 0
        ? `${videos.length} video${videos.length === 1 ? '' : 's'}`
        : 'No media';

  return (
    <AdminProductCollapsibleSection
      title="Media"
      icon="images-outline"
      collapsedPreview={<SectionPreview text={preview} />}
    >
      {images.length > 0 ? (
        <>
          <AppText variant="caption" color="textMuted" style={styles.groupLabel}>
            Images ({images.length})
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageStrip}>
            {images.map((image, index) => (
              <View key={`${image.fileName ?? 'image'}-${index}`} style={styles.imageTile}>
                {image.imageUrl ? (
                  <Image source={{ uri: image.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <AppText variant="caption" color="textMuted">
                      No preview
                    </AppText>
                  </View>
                )}
                {image.altText?.trim() ? (
                  <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.imageAlt}>
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
          <AppText variant="caption" color="textMuted" style={styles.groupLabel}>
            Videos ({videos.length})
          </AppText>
          {videos.map((video, index) => (
            <AdminProductDetailRow
              key={`video-${index}`}
              label={`Video ${index + 1}`}
              value={video.videoUrl?.trim() || '—'}
              isLink={Boolean(video.videoUrl?.trim())}
            />
          ))}
        </View>
      ) : null}
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductShippingSection({ product }: { product: Product }) {
  const fields = getAdminProductShippingFields(product);
  const preview = fields.find((field) => field.value !== '—')?.value ?? 'Not configured';

  return (
    <AdminProductCollapsibleSection
      title="Shipping"
      icon="cube-outline"
      collapsedPreview={<SectionPreview text={preview} />}
    >
      <AdminProductDetailFieldList fields={fields} />
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductDownloadSection({ product }: { product: Product }) {
  const download = getAdminProductDownloadInfo(product);
  const preview = download?.fileName ?? 'No file';

  return (
    <AdminProductCollapsibleSection
      title="Download"
      icon="cloud-download-outline"
      collapsedPreview={<SectionPreview text={preview} />}
    >
      {download ? (
        <>
          <AdminProductDetailRow label="File name" value={download.fileName} />
          <AdminProductDetailRow
            label="Download URL"
            value={download.fileUrl?.trim() || '—'}
            isLink={Boolean(download.fileUrl?.trim())}
            multiline
          />
        </>
      ) : (
        <AppText variant="bodySmall" color="textMuted">
          No downloadable file attached.
        </AppText>
      )}
    </AdminProductCollapsibleSection>
  );
}

export function AdminProductSeoSection({ product }: { product: Product }) {
  const seoFields = getAdminProductSeoFields(product);
  const metaTitle = product.metaTitle?.trim();
  const preview = metaTitle || 'Not configured';

  return (
    <AdminProductCollapsibleSection
      title="SEO"
      icon="search-outline"
      collapsedPreview={<SectionPreview text={preview} />}
    >
      <View style={styles.seoBlock}>
        <AppText variant="caption" color="textMuted" style={styles.groupLabel}>
          URLs
        </AppText>
        <AdminProductDetailFieldList
          fields={seoFields
            .filter((field) => field.label.includes('URL'))
            .map((field) => ({
              ...field,
              isLink: field.value !== '—',
              multiline: true,
            }))}
        />
      </View>

      <View style={styles.seoBlock}>
        <AppText variant="caption" color="textMuted" style={styles.groupLabel}>
          Meta tags
        </AppText>
        <AdminProductDetailFieldList
          fields={seoFields
            .filter((field) => !field.label.includes('URL'))
            .map((field) => ({
              ...field,
              layout: 'stacked' as const,
              multiline:
                field.label === 'Meta title' ||
                field.label === 'Meta description' ||
                field.label === 'Meta keywords',
            }))}
        />
      </View>
    </AdminProductCollapsibleSection>
  );
}

function VariationQuickStats({ fields }: { fields: Array<{ label: string; value: string }> }) {
  const stock = fields.find((field) => field.label === 'Stock status')?.value;
  const price =
    fields.find((field) => field.label === 'Price (currency)')?.value
    ?? fields.find((field) => field.label === 'Price (CAD)')?.value;

  if (!stock && !price) {
    return null;
  }

  return (
    <View style={styles.variationStats}>
      {price ? (
        <AppText variant="bodySmall" style={styles.variationStat}>
          {price}
        </AppText>
      ) : null}
      {stock ? (
        <AppText variant="caption" color="textSecondary">
          {stock}
        </AppText>
      ) : null}
    </View>
  );
}

export function AdminProductVariationsSection({ product }: { product: Product }) {
  const rows = buildAdminVariationDisplayRows(product);
  const preview =
    rows.length === 0
      ? 'No variations'
      : rows.length === 1
        ? rows[0].title
        : `${rows.length} variations`;

  return (
    <AdminProductCollapsibleSection
      title="Variations"
      icon="git-branch-outline"
      collapsedPreview={<SectionPreview text={preview} />}
    >
      {rows.length === 0 ? (
        <AppText variant="bodySmall" color="textMuted">
          No variations configured.
        </AppText>
      ) : (
        <View style={styles.variationList}>
          {rows.map((row, index) => (
            <View key={row.id} style={styles.variationCard}>
              <View style={styles.variationHeader}>
                <AppText variant="caption" color="textMuted" style={styles.variationIndex}>
                  #{index + 1}
                </AppText>
                <AppText variant="bodySmall" style={styles.variationTitle} numberOfLines={2}>
                  {row.title}
                </AppText>
              </View>

              <View style={styles.variationBody}>
                {row.imageUrl ? (
                  <Image source={{ uri: row.imageUrl }} style={styles.variationThumb} resizeMode="cover" />
                ) : (
                  <View style={styles.variationThumbPlaceholder}>
                    <AppText variant="caption" color="textMuted">
                      No image
                    </AppText>
                  </View>
                )}

                <View style={styles.variationContent}>
                  {row.attributes.length > 0 ? (
                    <View style={styles.chipRow}>
                      {row.attributes
                        .filter((attribute) => attribute.value !== '—')
                        .map((attribute) => (
                          <AdminProductDetailChip
                            key={`${row.id}-${attribute.label}`}
                            label={`${attribute.label}: ${attribute.value}`}
                          />
                        ))}
                    </View>
                  ) : null}

                  <VariationQuickStats fields={row.fields} />
                </View>
              </View>

              <AdminProductDetailFieldList fields={row.fields} />
            </View>
          ))}
        </View>
      )}
    </AdminProductCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  previewText: {
    textAlign: 'right',
  },
  groupLabel: {
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  imageStrip: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  imageTile: {
    width: 96,
    gap: spacing.xs,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
  imagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  imageAlt: {
    lineHeight: 16,
  },
  videoBlock: {
    gap: spacing.sm,
  },
  seoBlock: {
    gap: spacing.sm,
  },
  variationList: {
    gap: spacing.md,
  },
  variationCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  variationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  variationIndex: {
    fontWeight: '700',
    minWidth: 24,
  },
  variationTitle: {
    flex: 1,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  variationBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  variationThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  variationThumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  variationContent: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  variationStats: {
    gap: 2,
  },
  variationStat: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
