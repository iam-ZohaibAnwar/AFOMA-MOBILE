import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import {
  AdminProductCardActionsMenu,
  type AdminProductCardActionId,
} from '../components/AdminProductCardActionsMenu';
import { AdminProductDetailOperationsCard } from '../components/AdminProductDetailOperationsCard';
import { AdminProductDetailHero } from '../components/detail/AdminProductDetailHero';
import { AdminProductDetailInfoCard } from '../components/detail/AdminProductDetailInfoCard';
import { AdminProductDetailSellerCard } from '../components/detail/AdminProductDetailSellerCard';
import {
  AdminProductDownloadSection,
  AdminProductMediaSection,
  AdminProductSeoSection,
  AdminProductShippingSection,
  AdminProductVariationsSection,
} from '../components/detail/AdminProductDetailSections';
import { useAdminDuplicateProduct } from '../hooks/useAdminDuplicateProduct';
import { useAdminProductDetail } from '../hooks/useAdminProductDetail';
import { useAdminProductOperations } from '../hooks/useAdminProductOperations';
import type { AdminProductDetail } from '../types/adminProductManagement';
import { buildAdminProductDetailMenuActions } from '../utils/adminProductCardActions';
import { getAdminProductDetailSections } from '../utils/adminProductDetailDisplay';
import { getAdminDuplicateValidationMessage, validateAdminProductDuplicatable } from '../utils/adminProductDuplicatePayload';
import {
  canAdminEditProductType,
  canAdminEditProductVariations,
  navigateToAdminDuplicatedProductEdit,
  navigateToAdminProductEdit,
  navigateToAdminProductVariationsFromDetail,
} from '../utils/adminProductWriteNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductDetail'>;

export function AdminProductDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { productId, initialProduct } = route.params;
  const returnTo = authReturnTo.adminProductDetail(productId, initialProduct);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
    operationError,
    clearOperationError,
    changeApprovalStatus,
    setStoreVisibility,
    deleteProduct,
  } = useAdminProductOperations(productId, applyProductUpdate);

  const {
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

  const canEditVariations = displayProduct
    ? canAdminEditProductVariations(displayProduct.productType)
    : false;

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

  const handleDuplicatePress = useCallback(() => {
    if (!displayProduct) {
      return;
    }

    const validation = validateAdminProductDuplicatable(displayProduct);
    if (!validation.canDuplicate) {
      Alert.alert('Cannot duplicate', getAdminDuplicateValidationMessage(validation));
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

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Delete product?',
      'This permanently removes the product. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearOperationError();
            clearDuplicateError();
            void (async () => {
              const deleted = await deleteProduct();
              if (deleted) {
                navigation.goBack();
              }
            })();
          },
        },
      ],
    );
  }, [clearDuplicateError, clearOperationError, deleteProduct, navigation]);

  const menuActions = useMemo(
    () =>
      displayProduct
        ? buildAdminProductDetailMenuActions(displayProduct, { canEditVariations })
        : [],
    [canEditVariations, displayProduct],
  );

  const handleMenuSelect = useCallback(
    (actionId: AdminProductCardActionId) => {
      setMenuVisible(false);

      switch (actionId) {
        case 'edit':
          handleEditPress();
          break;
        case 'editVariations':
          handleEditVariationsPress();
          break;
        case 'duplicate':
          handleDuplicatePress();
          break;
        case 'delete':
          handleDeletePress();
          break;
        default:
          break;
      }
    },
    [handleDeletePress, handleDuplicatePress, handleEditPress, handleEditVariationsPress],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Product Detail',
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Product actions"
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation]);

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

  if (isLoading && !displayProduct) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="small" color={colors.primary} />
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
    <>
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
        <AdminProductDetailHero
          product={displayProduct}
          isRefreshing={isRefreshing}
          error={error}
          onRetry={error ? () => void refresh() : undefined}
        />

        <View style={styles.cards}>
          <AdminProductDetailInfoCard product={displayProduct} />
          <AdminProductDetailSellerCard product={displayProduct} />

          <AdminProductDetailOperationsCard
            product={displayProduct}
            isUpdatingApproval={isUpdatingApproval}
            isUpdatingVisibility={isUpdatingVisibility}
            onApprovalChange={handleApprovalChange}
            onEnablePress={handleEnablePress}
            onDisablePress={handleDisablePress}
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

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowMoreDetails((current) => !current)}
            style={({ pressed }) => [styles.moreToggle, pressed && styles.moreTogglePressed]}
          >
            <AppText variant="bodySmall" color="textSecondary" style={styles.moreToggleLabel}>
              {showMoreDetails ? 'Hide additional details' : 'Show additional details'}
            </AppText>
            <Ionicons
              name={showMoreDetails ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textMuted}
            />
          </Pressable>

          {showMoreDetails ? (
            <View style={styles.moreDetails}>
              <AdminProductMediaSection product={displayProduct} />
              {sections.shipping ? <AdminProductShippingSection product={displayProduct} /> : null}
              {sections.download ? <AdminProductDownloadSection product={displayProduct} /> : null}
              <AdminProductSeoSection product={displayProduct} />
              {sections.variations ? <AdminProductVariationsSection product={displayProduct} /> : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <AdminProductCardActionsMenu
        visible={menuVisible}
        productName={displayProduct.productName?.trim()}
        actions={menuActions}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  cards: {
    gap: spacing.md,
    paddingTop: spacing.md,
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
  headerAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  moreToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  moreTogglePressed: {
    opacity: 0.85,
  },
  moreToggleLabel: {
    fontWeight: '600',
  },
  moreDetails: {
    gap: spacing.md,
  },
});
