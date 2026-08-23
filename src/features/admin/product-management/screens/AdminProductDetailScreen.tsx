import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppDivider } from '../../../../components/ui/AppDivider';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminProductOperationsSection } from '../components/AdminProductOperationsSection';
import { AdminProductDetailHeader } from '../components/detail/AdminProductDetailHeader';
import {
  AdminProductApprovalSection,
  AdminProductCategoriesSection,
  AdminProductDownloadSection,
  AdminProductMediaSection,
  AdminProductPricingSection,
  AdminProductSellerSection,
  AdminProductSeoSection,
  AdminProductShippingSection,
  AdminProductSummarySection,
  AdminProductVariationsSection,
} from '../components/detail/AdminProductDetailSections';
import { useAdminDuplicateProduct } from '../hooks/useAdminDuplicateProduct';
import { useAdminProductDetail } from '../hooks/useAdminProductDetail';
import { useAdminProductOperations } from '../hooks/useAdminProductOperations';
import type { AdminProductDetail } from '../types/adminProductManagement';
import { getAdminProductDetailSections } from '../utils/adminProductDetailDisplay';
import {
  canAdminEditProductType,
  canAdminEditProductVariations,
  navigateToAdminDuplicatedProductEdit,
  navigateToAdminProductEdit,
  navigateToAdminProductVariationsFromDetail,
} from '../utils/adminProductWriteNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductDetail'>;

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="label" color="textSecondary">
        {title}
      </AppText>
      <AppDivider />
    </View>
  );
}

export function AdminProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { productId, initialProduct } = route.params;
  const returnTo = authReturnTo.adminProductDetail(productId, initialProduct);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const {
    product,
    isLoading,
    isRefreshing,
    error,
    isNotFound,
    refresh,
    syncSessionPatch,
    applyProductUpdate,
  } = useAdminProductDetail(isAuthorized ? productId : undefined, initialProduct);

  const {
    isUpdatingApproval,
    isUpdatingVisibility,
    isDeleting,
    operationError,
    clearOperationError,
    changeApprovalStatus,
    setStoreVisibility,
    deleteProduct,
  } = useAdminProductOperations(productId, applyProductUpdate);

  const {
    isDuplicating,
    duplicateError,
    clearDuplicateError,
    duplicateProduct,
  } = useAdminDuplicateProduct();

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displayProduct = product ?? initialProduct;
  const sections = useMemo(
    () => (displayProduct ? getAdminProductDetailSections(displayProduct) : null),
    [displayProduct],
  );

  const handleApprovalChange = useCallback(
    (productStatus: string) => {
      if (!displayProduct) {
        return;
      }

      clearOperationError();
      void changeApprovalStatus(displayProduct as AdminProductDetail, productStatus);
    },
    [changeApprovalStatus, clearOperationError, displayProduct],
  );

  const handleEnablePress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    clearOperationError();
    void setStoreVisibility(displayProduct as AdminProductDetail, 1);
  }, [clearOperationError, displayProduct, setStoreVisibility]);

  const handleDisablePress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    clearOperationError();
    void setStoreVisibility(displayProduct as AdminProductDetail, 0);
  }, [clearOperationError, displayProduct, setStoreVisibility]);

  const handleDeletePress = useCallback(() => {
    clearOperationError();
    clearDuplicateError();
    void (async () => {
      const deleted = await deleteProduct();
      if (deleted) {
        navigation.goBack();
      }
    })();
  }, [clearDuplicateError, clearOperationError, deleteProduct, navigation]);

  const handleDuplicatePress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    clearOperationError();
    clearDuplicateError();
    void (async () => {
      const duplicated = await duplicateProduct(displayProduct as AdminProductDetail);
      if (duplicated) {
        navigateToAdminDuplicatedProductEdit(navigation, duplicated);
      }
    })();
  }, [
    clearDuplicateError,
    clearOperationError,
    displayProduct,
    duplicateProduct,
    navigation,
  ]);

  const handleEditPress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    navigateToAdminProductEdit(navigation, displayProduct);
  }, [displayProduct, navigation]);

  const handleEditVariationsPress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    navigateToAdminProductVariationsFromDetail(navigation, displayProduct);
  }, [displayProduct, navigation]);

  const canEditProduct = displayProduct
    ? canAdminEditProductType(displayProduct.productType)
    : false;
  const canEditVariations = displayProduct
    ? canAdminEditProductVariations(displayProduct.productType)
    : false;

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !displayProduct) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState
          message={isNotFound ? 'Product not found.' : error}
          onAction={() => void refresh()}
          style={styles.errorState}
        />
      </View>
    );
  }

  if (!displayProduct || !sections) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.primary}
        />
      }
    >
      <AdminProductDetailHeader
        product={displayProduct}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={error ? () => void refresh() : undefined}
        onEditPress={canEditProduct ? handleEditPress : undefined}
        onEditVariationsPress={canEditVariations ? handleEditVariationsPress : undefined}
      />

      <SectionHeader title="Operations" />
      <AdminProductOperationsSection
        product={displayProduct}
        isUpdatingApproval={isUpdatingApproval}
        isUpdatingVisibility={isUpdatingVisibility}
        isDeleting={isDeleting}
        isDuplicating={isDuplicating}
        onApprovalChange={handleApprovalChange}
        onEnablePress={handleEnablePress}
        onDisablePress={handleDisablePress}
        onDeletePress={handleDeletePress}
        onDuplicatePress={canEditProduct ? handleDuplicatePress : undefined}
      />

      {operationError || duplicateError ? (
        <ErrorState
          message={operationError ?? duplicateError ?? ''}
          actionLabel="Dismiss"
          onAction={() => {
            clearOperationError();
            clearDuplicateError();
          }}
          style={styles.inlineError}
        />
      ) : null}

      <AdminProductSummarySection product={displayProduct} />
      <AdminProductSellerSection product={displayProduct} />
      <AdminProductApprovalSection product={displayProduct} />
      <AdminProductCategoriesSection product={displayProduct} />
      <AdminProductPricingSection product={displayProduct} />
      <AdminProductMediaSection product={displayProduct} />

      {sections.shipping ? <AdminProductShippingSection product={displayProduct} /> : null}
      {sections.download ? <AdminProductDownloadSection product={displayProduct} /> : null}

      <AdminProductSeoSection product={displayProduct} />

      {sections.variations ? <AdminProductVariationsSection product={displayProduct} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorState: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  sectionHeader: {
    gap: spacing.sm,
  },
});
