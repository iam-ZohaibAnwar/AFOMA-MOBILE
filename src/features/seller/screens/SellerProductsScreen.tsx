import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { SearchBar } from '../../../components/ecommerce/SearchBar';
import { SelectField } from '../../../components/forms';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import type { Product } from '../../../services/types/product';
import { getErrorMessage } from '../../../services/api/errors';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerSetupProgress } from '../components/SellerSetupProgress';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import {
  submitProductForReview,
  updateProductsActiveStatus,
} from '../products/api/sellerProductsApi';
import { SellerProductCard } from '../products/components/SellerProductCard';
import { useSellerProducts } from '../products/hooks/useSellerProducts';
import { navigateToEditProduct } from '../products/utils/sellerProductNavigation';
import {
  SELLER_APPROVAL_STATUS_FILTERS,
  SELLER_INVENTORY_STATUS_FILTERS,
} from '../products/utils/sellerProductListDisplay';
import {
  openSellerProductTypeSelection,
} from '../products/utils/sellerProductCreationNavigation';
import { canSellerCreateProducts, SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE } from '../utils/sellerProductGate';
import {
  getContinueSetupSection,
  isSellerProductCreationAllowed,
} from '../utils/sellerSetupSections';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerProducts'>;

const PRODUCTS_RETURN_TO = authReturnTo.sellerProducts();

export function SellerProductsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(PRODUCTS_RETURN_TO);
  const { profile } = useSellerProfile(isAuthorized ? sellerId : undefined);
  const {
    products,
    filteredProducts,
    totalProducts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    deleteError,
    deletingProductId,
    searchTerm,
    setSearchTerm,
    approvalStatusFilter,
    setApprovalStatusFilter,
    inventoryStatusFilter,
    setInventoryStatusFilter,
    hasMore,
    loadMore,
    refresh,
    removeProduct,
    clearDeleteError,
  } = useSellerProducts(isAuthorized ? sellerId : undefined);

  const setupComplete = isSellerProductCreationAllowed(profile?.profileSetup);
  const canCreate = canSellerCreateProducts(profile?.profileSetup);
  const [submittingProductId, setSubmittingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  const handleContinueSetup = () => {
    const nextSection = getContinueSetupSection(profile);
    if (nextSection) {
      navigation.navigate('SellerSetupSection', { section: nextSection });
      return;
    }
    navigation.navigate('SellerSetup');
  };

  const handleCreateProduct = () => {
    openSellerProductTypeSelection(navigation, profile);
  };

  const handleDelete = useCallback(
    async (product: Product) => {
      clearDeleteError();
      if (!product._id) {
        return;
      }

      await removeProduct(product._id);
    },
    [clearDeleteError, removeProduct],
  );

  const handleEdit = useCallback(
    (product: Product) => {
      navigateToEditProduct(navigation, product);
    },
    [navigation],
  );

  const handleSubmitForReview = useCallback(
    async (product: Product) => {
      if (!product._id) {
        return;
      }

      setActionError(null);
      setSubmittingProductId(product._id);

      try {
        await submitProductForReview(product._id);
        await refresh();
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to submit product for review'));
      } finally {
        setSubmittingProductId(null);
      }
    },
    [refresh],
  );

  const handleToggleActive = useCallback(
    async (product: Product) => {
      if (!product._id) {
        return;
      }

      setActionError(null);
      setTogglingProductId(product._id);

      try {
        await updateProductsActiveStatus([product._id], product.status === 1 ? 0 : 1);
        await refresh();
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update product status'));
      } finally {
        setTogglingProductId(null);
      }
    },
    [refresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <SellerProductCard
        product={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmitForReview={handleSubmitForReview}
        onToggleActive={handleToggleActive}
        isDeleting={deletingProductId === item._id}
        isSubmitting={submittingProductId === item._id}
        isToggling={togglingProductId === item._id}
      />
    ),
    [
      deletingProductId,
      handleDelete,
      handleEdit,
      handleSubmitForReview,
      handleToggleActive,
      submittingProductId,
      togglingProductId,
    ],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && filteredProducts.length === 0 && !error) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading products...
        </AppText>
      </View>
    );
  }

  if (error && filteredProducts.length === 0 && totalProducts === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  const hasActiveFilters = Boolean(searchTerm.trim() || approvalStatusFilter || inventoryStatusFilter);
  const isFilteredEmpty = filteredProducts.length === 0 && products.length > 0;

  const listHeader = (
    <View style={styles.headerContent}>
      {!setupComplete ? (
        <AppCard variant="flat">
          <SellerSetupProgress profileSetup={profile?.profileSetup} onContinue={handleContinueSetup} />
        </AppCard>
      ) : null}

      <SearchBar
        mode="input"
        placeholder="Search by name..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.filtersRow}>
        <SelectField
          label="Approval status"
          value={approvalStatusFilter}
          options={SELLER_APPROVAL_STATUS_FILTERS}
          onChange={(value) => setApprovalStatusFilter(value as typeof approvalStatusFilter)}
          modalTitle="Filter by approval status"
        />
        <SelectField
          label="Inventory status"
          value={inventoryStatusFilter}
          options={SELLER_INVENTORY_STATUS_FILTERS}
          onChange={(value) => setInventoryStatusFilter(value as typeof inventoryStatusFilter)}
          modalTitle="Filter by inventory status"
        />
      </View>

      <AppButton
        label="Add product"
        onPress={handleCreateProduct}
        fullWidth
        disabled={!canCreate}
      />

      {!canCreate ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.setupHint}>
          {SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE}
        </AppText>
      ) : null}

      {deleteError ? (
        <ErrorState message={deleteError} onAction={clearDeleteError} style={styles.inlineError} />
      ) : null}

      {actionError ? (
        <ErrorState message={actionError} onAction={() => setActionError(null)} style={styles.inlineError} />
      ) : null}

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {totalProducts > 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          {hasActiveFilters
            ? `${filteredProducts.length} of ${products.length} loaded products`
            : `${totalProducts} products`}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
      data={filteredProducts}
      keyExtractor={(item, index) => item._id ?? `product-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        isFilteredEmpty ? (
          <EmptyState
            title="No matching products"
            message="Try adjusting your search or filters."
            style={styles.emptyState}
          />
        ) : (
          <EmptyState
            title="No products added"
            message="Start building your inventory by adding your first product."
            actionLabel={canCreate ? 'Add product' : 'Continue setup'}
            onAction={canCreate ? handleCreateProduct : handleContinueSetup}
            style={styles.emptyState}
          />
        )
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      onEndReached={() => {
        if (!searchTerm && !approvalStatusFilter && !inventoryStatusFilter) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  filtersRow: {
    gap: spacing.md,
  },
  setupHint: {
    lineHeight: 20,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
