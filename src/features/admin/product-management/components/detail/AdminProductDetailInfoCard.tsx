import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../../components/ui/AppText';
import type { Product } from '../../../../../services/types/product';
import { spacing } from '../../../../../design-system';
import {
  formatAdminProductDescription,
  formatAdminProductDimensionsCompact,
  formatAdminProductWeightDisplay,
  getAdminProductCategoryPath,
  getAdminProductDescriptionSnippet,
  getAdminProductMaterialsLabel,
} from '../../utils/adminProductDetailDisplay';
import { AdminProductCollapsibleSection } from './AdminProductCollapsibleSection';
import { AdminProductDetailMetricRow } from './AdminProductDetailCardShell';

export function AdminProductDetailInfoCard({ product }: { product: Product }) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const fullDescription = formatAdminProductDescription(product);
  const snippet = getAdminProductDescriptionSnippet(product);
  const canExpand = fullDescription.trim().length > snippet.replace('…', '').length;
  const categoryPath = getAdminProductCategoryPath(product);

  return (
    <AdminProductCollapsibleSection
      title="Product Information"
      icon="document-text-outline"
      initiallyExpanded
      collapsedPreview={
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.previewText}>
          {categoryPath}
        </AppText>
      }
    >
      <AdminProductDetailMetricRow label="Category" value={categoryPath} />
      <AdminProductDetailMetricRow label="Materials" value={getAdminProductMaterialsLabel(product)} />
      <AdminProductDetailMetricRow
        label="Dimensions"
        value={formatAdminProductDimensionsCompact(product)}
      />
      <AdminProductDetailMetricRow label="Weight" value={formatAdminProductWeightDisplay(product)} />

      <View style={styles.descriptionBlock}>
        <AppText variant="caption" color="textMuted" style={styles.descriptionLabel}>
          Description
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.descriptionText}>
          {showFullDescription ? fullDescription.trim() || 'No description provided.' : snippet}
        </AppText>
        {canExpand ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowFullDescription((current) => !current)}
            style={styles.descriptionToggle}
          >
            <AppText variant="bodySmall" color="textLink">
              {showFullDescription ? 'Show less' : 'View full description'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </AdminProductCollapsibleSection>
  );
}

const styles = StyleSheet.create({
  previewText: {
    textAlign: 'right',
  },
  descriptionBlock: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  descriptionLabel: {
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  descriptionText: {
    lineHeight: 20,
  },
  descriptionToggle: {
    alignSelf: 'flex-start',
    paddingTop: spacing.xs,
  },
});
