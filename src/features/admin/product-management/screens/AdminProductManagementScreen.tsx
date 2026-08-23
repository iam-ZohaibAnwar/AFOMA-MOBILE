import { useCallback, useMemo, useState } from 'react';

import {

  ActivityIndicator,

  FlatList,

  Pressable,

  RefreshControl,

  StyleSheet,

  View,

} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { EmptyState } from '../../../../components/ecommerce/EmptyState';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { SearchBar } from '../../../../components/ecommerce/SearchBar';

import { AppButton } from '../../../../components/ui/AppButton';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { AdminProductBulkActionsBar } from '../components/AdminProductBulkActionsBar';

import { AdminProductCard } from '../components/AdminProductCard';

import { AdminProductFiltersSheet } from '../components/AdminProductFiltersSheet';

import { useAdminProductList } from '../hooks/useAdminProductList';

import type { AdminProductListItem } from '../types/adminProductManagement';

import {

  ADMIN_PRODUCT_APPROVAL_FILTERS,

  ADMIN_PRODUCT_INVENTORY_FILTERS,

} from '../utils/adminProductDisplay';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductManagement'>;



const LIST_RETURN_TO = authReturnTo.adminProductManagement();



export function AdminProductManagementScreen({ navigation, route }: Props) {

  const insets = useSafeAreaInsets();

  const { isAuthorized } = useRequireAdmin(LIST_RETURN_TO);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);



  const initialFilters = useMemo(

    () => ({

      initialApprovalFilter: route.params?.initialApprovalFilter,

      initialInventoryFilter: route.params?.initialInventoryFilter,

    }),

    [route.params?.initialApprovalFilter, route.params?.initialInventoryFilter],

  );



  const {

    products,

    currentPage,

    totalPages,

    totalProducts,

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

    clearFilters,

    refresh,

    goToPreviousPage,

    goToNextPage,

    canGoPrevious,

    canGoNext,

    actionError,

    clearActionError,

    isBulkUpdating,

    bulkSetStoreVisibility,

  } = useAdminProductList(isAuthorized, initialFilters);



  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);



  const activeFilterSummary = useMemo(() => {

    const parts: string[] = [];



    if (approvalFilter) {

      const match = ADMIN_PRODUCT_APPROVAL_FILTERS.find((option) => option.value === approvalFilter);

      parts.push(`Approval: ${match?.label ?? approvalFilter}`);

    }



    if (inventoryFilter) {

      const match = ADMIN_PRODUCT_INVENTORY_FILTERS.find((option) => option.value === inventoryFilter);

      parts.push(`Visibility: ${match?.label ?? inventoryFilter}`);

    }



    return parts.join(' · ');

  }, [approvalFilter, inventoryFilter]);



  const handleProductPress = useCallback(

    (product: AdminProductListItem) => {

      if (!product._id) {

        return;

      }



      navigation.navigate('AdminProductDetail', {

        productId: product._id,

        productType: product.productType,

        initialProduct: product,

      });

    },

    [navigation],

  );



  const handleSelectToggle = useCallback((product: AdminProductListItem) => {

    const productId = product._id;

    if (!productId) {

      return;

    }



    setSelectedIds((current) =>

      current.includes(productId)

        ? current.filter((id) => id !== productId)

        : [...current, productId],

    );

  }, []);



  const handleClearSelection = useCallback(() => {

    setSelectedIds([]);

  }, []);



  const handleBulkEnable = useCallback(() => {

    clearActionError();

    void (async () => {

      const success = await bulkSetStoreVisibility(selectedIds, 1);

      if (success) {

        setSelectedIds([]);

      }

    })();

  }, [bulkSetStoreVisibility, clearActionError, selectedIds]);



  const handleBulkDisable = useCallback(() => {

    clearActionError();

    void (async () => {

      const success = await bulkSetStoreVisibility(selectedIds, 0);

      if (success) {

        setSelectedIds([]);

      }

    })();

  }, [bulkSetStoreVisibility, clearActionError, selectedIds]);



  const renderItem = useCallback(

    ({ item }: { item: AdminProductListItem }) => (

      <AdminProductCard

        product={item}

        onPress={handleProductPress}

        selectable

        selected={Boolean(item._id && selectedIdSet.has(item._id))}

        onSelectToggle={handleSelectToggle}

        selectionDisabled={isBulkUpdating}

      />

    ),

    [handleProductPress, handleSelectToggle, isBulkUpdating, selectedIdSet],

  );



  const listHeader = (

    <View style={styles.headerContent}>

      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <AppText variant="h3">Product Management</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
            </AppText>
          </View>
          <AppButton
            label="Add product"
            variant="outline"
            onPress={() => navigation.navigate('AdminProductType')}
          />
        </View>
      </View>



      <SearchBar

        mode="input"

        placeholder="Search by product name..."

        value={searchInput}

        onChangeText={setSearchInput}

      />



      <View style={styles.filterRow}>

        <AppButton

          label={hasActiveFilters ? 'Filters (active)' : 'Filters'}

          variant="outline"

          onPress={() => setFiltersVisible(true)}

        />

        {hasActiveFilters ? (

          <Pressable accessibilityRole="button" onPress={clearFilters} style={styles.clearFilters}>

            <AppText variant="bodySmall" color="textLink">

              Clear

            </AppText>

          </Pressable>

        ) : null}

      </View>



      {activeFilterSummary ? (

        <AppText variant="caption" color="textSecondary">

          {activeFilterSummary}

        </AppText>

      ) : null}



      <AdminProductBulkActionsBar

        selectedCount={selectedIds.length}

        isUpdating={isBulkUpdating}

        onEnable={handleBulkEnable}

        onDisable={handleBulkDisable}

        onClearSelection={handleClearSelection}

      />



      {actionError ? (

        <ErrorState message={actionError} onAction={clearActionError} style={styles.inlineError} />

      ) : null}



      {error && products.length === 0 ? (

        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />

      ) : null}



      {error && products.length > 0 ? (
        <ErrorState
          message={error}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.inlineError}
        />
      ) : null}

      {isLoading && products.length === 0 && !error ? (

        <View style={styles.inlineLoading}>

          <ActivityIndicator size="small" color={colors.primary} />

          <AppText variant="bodySmall" color="textSecondary">

            Loading products...

          </AppText>

        </View>

      ) : null}

    </View>

  );



  const listFooter =

    products.length > 0 ? (

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



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  return (

    <>

      <FlatList

        style={styles.screen}

        contentContainerStyle={[

          styles.content,

          { paddingBottom: insets.bottom + spacing.xxl },

          products.length === 0 && styles.emptyContent,

        ]}

        data={products}

        keyExtractor={(item, index) => item._id ?? `admin-product-${index}`}

        renderItem={renderItem}

        extraData={selectedIds}

        ItemSeparatorComponent={() => <View style={styles.separator} />}

        ListHeaderComponent={listHeader}

        ListFooterComponent={listFooter}

        ListEmptyComponent={

          !isLoading && !error ? (

            <EmptyState

              title="No products found"

              message={

                hasActiveFilters || searchInput.trim()

                  ? 'Try adjusting your search or filters.'

                  : 'Platform products will appear here once sellers add inventory.'

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

      />



      <AdminProductFiltersSheet

        visible={filtersVisible}

        approvalFilter={approvalFilter}

        inventoryFilter={inventoryFilter}

        onClose={() => setFiltersVisible(false)}

        onApply={(nextApproval, nextInventory) => {

          applyApprovalFilter(nextApproval);

          applyInventoryFilter(nextInventory);

        }}

        onClear={() => {

          clearFilters();

          setFiltersVisible(false);

        }}

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

    gap: spacing.lg,

  },

  emptyContent: {

    flexGrow: 1,

  },

  headerContent: {

    gap: spacing.md,

  },

  titleBlock: {

    gap: spacing.xs,

  },

  titleRow: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    gap: spacing.md,

  },

  titleCopy: {

    flex: 1,

    gap: spacing.xs,

  },

  filterRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.md,

  },

  clearFilters: {

    paddingVertical: spacing.sm,

  },

  inlineError: {

    alignSelf: 'stretch',

    marginHorizontal: 0,

  },

  inlineLoading: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    paddingVertical: spacing.md,

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

});


