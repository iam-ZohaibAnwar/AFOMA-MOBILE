import { useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import type { Product } from '../../../services/types/product';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerSetupProgress } from '../components/SellerSetupProgress';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { AdminProductCardSkeleton } from '../../admin/product-management/components/AdminProductCardSkeleton';
import { OrderListSearchBar } from '../../orders/components/OrderListSearchBar';
import { SellerProductCard } from '../products/components/SellerProductCard';
import { SellerProductCardActionsMenu } from '../products/components/SellerProductCardActionsMenu';
import { SellerProductFilterTabs } from '../products/components/SellerProductFilterTabs';
import { useSellerProductCardActions } from '../products/hooks/useSellerProductCardActions';
import { useSellerProducts } from '../products/hooks/useSellerProducts';
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
const SKELETON_ITEMS = ['s1', 's2', 's3'] as const;

export function SellerProductsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(PRODUCTS_RETURN_TO);
  const { profile } = useSellerProfile(isAuthorized ? sellerId : undefined);

  const {
    products,
    pageProducts,
    totalProducts,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    approvalFilter,
    inventoryFilter,
    hasActiveFilters,
    applyApprovalFilter,
    applyInventoryFilter,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useSellerProducts(isAuthorized ? sellerId : undefined);

  const {
    menuProduct,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleEdit,
    busyProductId,
  } = useSellerProductCardActions(navigation, () => {
    void refresh();
  });

  const setupComplete = isSellerProductCreationAllowed(profile?.profileSetup);
  const canCreate = canSellerCreateProducts(profile?.profileSetup);
  const showSkeletonList = isLoading && pageProducts.length === 0 && !error;

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

  const handleTabSelect = useCallback(
    (approval: typeof approvalFilter, inventory: typeof inventoryFilter) => {
      applyApprovalFilter(approval);
      applyInventoryFilter(inventory);
    },
    [applyApprovalFilter, applyInventoryFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <SellerProductCard
        product={item}
        onPress={handleEdit}
        onMenuPress={openMenu}
        isBusy={Boolean(item._id && busyProductId === item._id)}
      />
    ),
    [busyProductId, handleEdit, openMenu],
  );

  const setupBanner = !setupComplete ? (
    <AppCard variant="flat">
      <SellerSetupProgress profileSetup={profile?.profileSetup} onContinue={handleContinueSetup} />
    </AppCard>
  ) : null;

  const countLabel = useMemo(() => {
    if (totalProducts <= 0) {
      return null;
    }

    if (hasActiveFilters) {
      return `${products.length} on this page · ${totalProducts} total`;
    }

    return `${totalProducts} ${totalProducts === 1 ? 'product' : 'products'}`;
  }, [hasActiveFilters, products.length, totalProducts]);

  const listHeader = (
    <View style={styles.headerContent}>
      {setupBanner}

      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by product name..."
        accessibilityLabel="Search products by name"
      />

      <SellerProductFilterTabs
        approvalFilter={approvalFilter}
        inventoryFilter={inventoryFilter}
        onSelect={handleTabSelect}
      />

      {countLabel ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {countLabel}
        </AppText>
      ) : null}

      {!canCreate ? (
        <AppText variant="caption" color="textMuted">
          {SELLER_PRODUCT_CREATION_BLOCKED_MESSAGE}
        </AppText>
      ) : null}

      {error && pageProducts.length === 0 && !showSkeletonList ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {error && pageProducts.length > 0 ? (
        <ErrorState
          message={error}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.inlineError}
        />
      ) : null}
    </View>
  );

  const listFooter =
    pageProducts.length > 0 ? (
      <View style={styles.pagination}>
        <Pressable
          accessibilityRole="button"
          onPress={goToPreviousPage}
          disabled={!canGoPrevious}
          style={[styles.paginationButton, !canGoPrevious && styles.paginationButtonDisabled]}
        >
          <AppText variant="bodySmall" color={canGoPrevious ? 'textLink' : 'textMuted'}>
            Previous
          </AppText>
        </Pressable>

        <AppText variant="bodySmall" color="textSecondary">
          Page {currentPage} of {totalPages}
        </AppText>

        <Pressable
          accessibilityRole="button"
          onPress={goToNextPage}
          disabled={!canGoNext}
          style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
        >
          <AppText variant="bodySmall" color={canGoNext ? 'textLink' : 'textMuted'}>
            Next
          </AppText>
        </Pressable>
      </View>
    ) : null;

  const emptyMessage = hasActiveFilters || searchInput.trim()
    ? 'Try adjusting your search or status tab on this page.'
    : canCreate
      ? 'Start building your inventory by adding your first product.'
      : 'Complete shop setup to start adding products.';

  const fab = canCreate ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add product"
      onPress={handleCreateProduct}
      style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
    >
      <Ionicons name="add" size={28} color={colors.textInverse} />
    </Pressable>
  ) : null;

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (showSkeletonList) {
    return (
      <>
        <FlatList
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl + (canCreate ? 72 : 0) },
          ]}
          data={SKELETON_ITEMS}
          keyExtractor={(item) => item}
          renderItem={() => <AdminProductCardSkeleton />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={listHeader}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
        {fab}
      </>
    );
  }

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl + (canCreate ? 72 : 0) },
          products.length === 0 && pageProducts.length === 0 && styles.emptyContent,
        ]}
        data={products}
        keyExtractor={(item, index) => item._id ?? `seller-product-${index}`}
        renderItem={renderItem}
        extraData={busyProductId}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title={hasActiveFilters ? 'No matching products' : 'No products added'}
              message={emptyMessage}
              actionLabel={!hasActiveFilters ? (canCreate ? 'Add product' : 'Continue setup') : undefined}
              onAction={
                !hasActiveFilters
                  ? canCreate
                    ? handleCreateProduct
                    : handleContinueSetup
                  : undefined
              }
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      {fab}

      <SellerProductCardActionsMenu
        visible={Boolean(menuProduct)}
        productName={menuProduct?.productName?.trim() || 'Untitled product'}
        actions={menuActions}
        onClose={closeMenu}
        onSelect={handleMenuAction}
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  countText: {
    fontWeight: '600',
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  separator: {
    height: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.floating,
  },
});
