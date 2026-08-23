import { Alert, Image, StyleSheet, View } from 'react-native';



import { AppBadge } from '../../../../components/ui/AppBadge';

import { AppButton } from '../../../../components/ui/AppButton';

import { AppText } from '../../../../components/ui/AppText';

import { colors, radius, spacing } from '../../../../design-system';

import { getProductDisplayName, getProductImageUrl } from '../../../products/utils/productDisplay';

import type { Product } from '../../../../services/types/product';

import { canSubmitProductForReview } from '../api/sellerProductsApi';

import {

  formatSellerApprovalStatus,

  formatSellerInventoryStatus,

  formatSellerListPrice,

  getSellerProductCategoryLabel,

} from '../utils/sellerProductListDisplay';



export interface SellerProductCardProps {

  product: Product;

  onEdit: (product: Product) => void;

  onDelete: (product: Product) => void;

  onSubmitForReview?: (product: Product) => void;

  onToggleActive?: (product: Product) => void;

  isDeleting?: boolean;

  isSubmitting?: boolean;

  isToggling?: boolean;

}



function statusBadgeVariant(status?: string): 'success' | 'warning' | 'neutral' {

  if (status === 'Approved' || status === 'Active') {

    return 'success';

  }



  if (status === 'Review' || status === 'Pending' || status === 'In Review') {

    return 'warning';

  }



  return 'neutral';

}



export function SellerProductCard({

  product,

  onEdit,

  onDelete,

  onSubmitForReview,

  onToggleActive,

  isDeleting = false,

  isSubmitting = false,

  isToggling = false,

}: SellerProductCardProps) {

  const imageUrl = getProductImageUrl(product);

  const approvalStatus = formatSellerApprovalStatus(product.productStatus);

  const inventoryStatus = formatSellerInventoryStatus(product.status);

  const categoryLabel = getSellerProductCategoryLabel(product);

  const canSubmit = canSubmitProductForReview(product.productStatus);

  const isActive = product.status === 1;



  const handleDeletePress = () => {

    Alert.alert(

      'Delete product',

      'Are you sure you want to delete this product?',

      [

        { text: 'Cancel', style: 'cancel' },

        {

          text: 'Delete',

          style: 'destructive',

          onPress: () => onDelete(product),

        },

      ],

    );

  };



  return (

    <View style={styles.card}>

      <View style={styles.headerRow}>

        {imageUrl ? (

          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

        ) : (

          <View style={[styles.image, styles.imagePlaceholder]}>

            <AppText variant="caption" color="textMuted">

              No image

            </AppText>

          </View>

        )}



        <View style={styles.summary}>

          <AppText variant="bodyMedium" style={styles.name} numberOfLines={2}>

            {getProductDisplayName(product)}

          </AppText>

          {product.productType ? (

            <AppText variant="bodySmall" color="textSecondary">

              {product.productType}

            </AppText>

          ) : null}

          {product.sku ? (

            <AppText variant="caption" color="textMuted">

              SKU: {product.sku}

            </AppText>

          ) : null}

        </View>

      </View>



      <View style={styles.metaRow}>

        <AppText variant="bodySmall" color="textSecondary">

          Price: {formatSellerListPrice(product)}

        </AppText>

        {categoryLabel ? (

          <AppText variant="caption" color="textMuted">

            {categoryLabel}

          </AppText>

        ) : null}

      </View>



      <View style={styles.badgesRow}>

        <AppBadge label={approvalStatus} variant={statusBadgeVariant(product.productStatus)} />

        <AppBadge label={inventoryStatus} variant={statusBadgeVariant(inventoryStatus)} />

      </View>



      <View style={styles.actionsRow}>

        <AppButton label="Edit" variant="outline" size="md" onPress={() => onEdit(product)} style={styles.actionButton} />

        {canSubmit && onSubmitForReview ? (

          <AppButton

            label={isSubmitting ? 'Submitting...' : 'Submit'}

            variant="outline"

            size="md"

            loading={isSubmitting}

            disabled={isSubmitting}

            onPress={() => onSubmitForReview(product)}

            style={styles.actionButton}

          />

        ) : null}

        {onToggleActive ? (

          <AppButton

            label={isToggling ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}

            variant="outline"

            size="md"

            loading={isToggling}

            disabled={isToggling}

            onPress={() => onToggleActive(product)}

            style={styles.actionButton}

          />

        ) : null}

        <AppButton

          label={isDeleting ? 'Deleting...' : 'Delete'}

          variant="outline"

          size="md"

          loading={isDeleting}

          disabled={isDeleting}

          onPress={handleDeletePress}

          style={styles.actionButton}

        />

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  card: {

    backgroundColor: colors.surface,

    borderRadius: radius.large,

    borderWidth: 1,

    borderColor: colors.borderStrong,

    padding: spacing.lg,

    gap: spacing.md,

  },

  headerRow: {

    flexDirection: 'row',

    gap: spacing.md,

  },

  image: {

    width: 72,

    height: 72,

    borderRadius: radius.medium,

    backgroundColor: colors.surfaceMuted,

  },

  imagePlaceholder: {

    alignItems: 'center',

    justifyContent: 'center',

  },

  summary: {

    flex: 1,

    gap: spacing.xs,

  },

  name: {

    color: colors.textPrimary,

    fontWeight: '700',

  },

  metaRow: {

    gap: spacing.xs,

  },

  badgesRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: spacing.sm,

  },

  actionsRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'flex-end',

    gap: spacing.sm,

  },

  actionButton: {

    minWidth: 96,

  },

});

