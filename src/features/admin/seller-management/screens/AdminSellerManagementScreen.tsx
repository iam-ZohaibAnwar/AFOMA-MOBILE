import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { AdminSellerCard } from '../components/AdminSellerCard';
import { AdminSellerFiltersSheet } from '../components/AdminSellerFiltersSheet';
import { useAdminSellerList } from '../hooks/useAdminSellerList';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import { getAdminSellerDisplayName } from '../utils/adminSellerDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerManagement'>;

const LIST_RETURN_TO = authReturnTo.adminSellerManagement();

export function AdminSellerManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(LIST_RETURN_TO);
  const [filtersVisible, setFiltersVisible] = useState(false);

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
    updatingSellerId,
    deletingSellerId,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    setShopVisibility,
    deleteSeller,
  } = useAdminSellerList(isAuthorized);

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];

    if (approvalFilter) {
      parts.push(`Approval: ${approvalFilter}`);
    }

    if (shopVisibilityFilter) {
      parts.push(`Shop: ${shopVisibilityFilter === 'Active' ? 'Visible' : 'Hidden'}`);
    }

    return parts.join(' · ');
  }, [approvalFilter, shopVisibilityFilter]);

  const handleSellerPress = useCallback(
    (seller: AdminSellerListItem) => {
      if (!seller._id) {
        return;
      }

      navigation.navigate('AdminSellerDetail', {
        sellerId: seller._id,
        initialSeller: seller,
      });
    },
    [navigation],
  );

  const handleVisibilityChange = useCallback(
    (seller: AdminSellerListItem, nextVisible: boolean) => {
      if (!seller._id) {
        return;
      }

      clearActionError();

      if (!nextVisible) {
        Alert.alert(
          'Hide this shop?',
          `${getAdminSellerDisplayName(seller)} will be hidden from buyers until visibility is turned back on.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Hide shop',
              style: 'destructive',
              onPress: () => {
                void setShopVisibility(seller._id, false);
              },
            },
          ],
        );
        return;
      }

      void setShopVisibility(seller._id, true);
    },
    [clearActionError, setShopVisibility],
  );

  const handleDeletePress = useCallback(
    (seller: AdminSellerListItem) => {
      if (!seller._id) {
        return;
      }

      clearActionError();

      Alert.alert(
        'Delete seller?',
        `This will permanently remove ${getAdminSellerDisplayName(seller)}. This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void deleteSeller(seller._id);
            },
          },
        ],
      );
    },
    [clearActionError, deleteSeller],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminSellerListItem }) => (
      <AdminSellerCard
        seller={item}
        isUpdatingVisibility={updatingSellerId === item._id}
        isDeleting={deletingSellerId === item._id}
        onPress={handleSellerPress}
        onVisibilityChange={handleVisibilityChange}
        onDeletePress={handleDeletePress}
      />
    ),
    [
      deletingSellerId,
      handleDeletePress,
      handleSellerPress,
      handleVisibilityChange,
      updatingSellerId,
    ],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <AppText variant="h3">Seller Management</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {totalSellers} {totalSellers === 1 ? 'seller' : 'sellers'}
            </AppText>
          </View>
          <AppButton
            label="Create seller"
            variant="outline"
            onPress={() => navigation.navigate('AdminCreateSeller')}
          />
        </View>
      </View>

      <SearchBar
        mode="input"
        placeholder="Search by seller name..."
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

      {actionError ? (
        <ErrorState
          message={actionError}
          actionLabel="Dismiss"
          onAction={clearActionError}
          style={styles.inlineError}
        />
      ) : null}

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {isLoading && sellers.length === 0 ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading sellers...
          </AppText>
        </View>
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

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
          sellers.length === 0 && styles.emptyContent,
        ]}
        data={sellers}
        keyExtractor={(item, index) => item._id ?? `admin-seller-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="No sellers found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or filters.'
                  : 'Sellers will appear here once they register.'
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
      />

      <AdminSellerFiltersSheet
        visible={filtersVisible}
        approvalFilter={approvalFilter}
        shopVisibilityFilter={shopVisibilityFilter}
        onClose={() => setFiltersVisible(false)}
        onApply={applyFilters}
        onClear={clearFilters}
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
    marginBottom: spacing.sm,
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
    marginTop: 0,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  paginationButton: {
    minWidth: 72,
    paddingVertical: spacing.sm,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
