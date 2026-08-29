import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { AdminProductCardActionsMenu } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerCard } from '../components/AdminSellerCard';
import { AdminSellerCardSkeleton } from '../components/AdminSellerCardSkeleton';
import { AdminSellerFilterTabs } from '../components/AdminSellerFilterTabs';
import { useAdminSellerCardActions } from '../hooks/useAdminSellerCardActions';
import { useAdminSellerList } from '../hooks/useAdminSellerList';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import { getAdminSellerDisplayName } from '../utils/adminSellerDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerManagement'>;

const LIST_RETURN_TO = authReturnTo.adminSellerManagement();
const SKELETON_ITEMS = ['s1', 's2', 's3'] as const;

export function AdminSellerManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(LIST_RETURN_TO);

  const {
    sellers,
    currentPage,
    totalPages,
    totalSellers,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    approvalFilter,
    shopVisibilityFilter,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    actionError,
    clearActionError,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useAdminSellerList(isAuthorized);

  const {
    menuSeller,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleView,
    busySellerId,
  } = useAdminSellerCardActions(navigation, () => {
    void refresh();
  });

  const showSkeletonList = isLoading && sellers.length === 0 && !error;

  const handleTabSelect = useCallback(
    (approval: typeof approvalFilter, shop: typeof shopVisibilityFilter) => {
      applyFilters(approval, shop);
    },
    [applyFilters],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminSellerListItem }) => (
      <AdminSellerCard
        seller={item}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={Boolean(item._id && busySellerId === item._id)}
      />
    ),
    [busySellerId, handleView, openMenu],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by seller name, shop, email..."
        accessibilityLabel="Search sellers by name, shop, or email"
      />

      <AdminSellerFilterTabs
        approvalFilter={approvalFilter}
        shopVisibilityFilter={shopVisibilityFilter}
        onSelect={handleTabSelect}
      />

      {totalSellers > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalSellers} {totalSellers === 1 ? 'seller' : 'sellers'}
        </AppText>
      ) : null}

      {actionError ? (
        <ErrorState
          message={actionError}
          actionLabel="Dismiss"
          onAction={clearActionError}
          style={styles.inlineError}
        />
      ) : null}

      {error && sellers.length === 0 && !showSkeletonList ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {error && sellers.length > 0 ? (
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
    sellers.length > 0 ? (
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

  if (showSkeletonList) {
    return (
      <>
        <FlatList
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl + 72 },
          ]}
          data={SKELETON_ITEMS}
          keyExtractor={(item) => item}
          renderItem={() => <AdminSellerCardSkeleton />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={listHeader}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create seller"
          onPress={() => navigation.navigate('AdminCreateSeller')}
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        >
          <Ionicons name="add" size={28} color={colors.textInverse} />
        </Pressable>
      </>
    );
  }

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl + 72 },
          sellers.length === 0 && styles.emptyContent,
        ]}
        data={sellers}
        keyExtractor={(item, index) => item._id ?? `admin-seller-${index}`}
        renderItem={renderItem}
        extraData={busySellerId}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="No sellers found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or status tab.'
                  : 'Sellers will appear here once they register on the platform.'
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create seller"
        onPress={() => navigation.navigate('AdminCreateSeller')}
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </Pressable>

      <AdminProductCardActionsMenu
        visible={Boolean(menuSeller)}
        productName={menuSeller ? getAdminSellerDisplayName(menuSeller) : undefined}
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
