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
import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminReviewCard } from '../components/AdminReviewCard';
import { AdminReviewCardSkeleton } from '../components/AdminReviewCardSkeleton';
import { AdminReviewStatusSheet } from '../components/AdminReviewStatusSheet';
import { AdminReviewStatusTabs } from '../components/AdminReviewStatusTabs';
import { AdminReviewTypeTabs } from '../components/AdminReviewTypeTabs';
import { AdminProductCardActionsMenu } from '../../product-management/components/AdminProductCardActionsMenu';
import {
  getAdminReviewMenuTitle,
  useAdminReviewCardActions,
  useAdminReviews,
} from '../hooks/useAdminReviews';
import type { AdminReviewListItem } from '../types/adminReviews';
import { getAdminReviewsEmptyStateMessage } from '../utils/adminReviewsDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReviews'>;

const RETURN_TO = authReturnTo.adminReviews();
const SKELETON_ITEMS = ['r1', 'r2', 'r3'] as const;

export function AdminReviewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [statusRow, setStatusRow] = useState<AdminReviewListItem | null>(null);

  const {
    reviews,
    filteredReviews,
    paginatedReviews,
    listTab,
    statusFilter,
    searchInput,
    setSearchInput,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    updatingReviewId,
    error,
    actionError,
    hasActiveFilters,
    refresh,
    applySessionPatchesToList,
    updateStatus,
    clearActionError,
    applyListTab,
    setStatusFilter,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useAdminReviews({ enabled: isAuthorized });

  const handleChangeStatus = useCallback(
    (review: AdminReviewListItem) => {
      clearActionError();
      setStatusRow(review);
    },
    [clearActionError],
  );

  const {
    menuReview,
    menuActions,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
  } = useAdminReviewCardActions(navigation, {
    listTab,
    onChangeStatus: handleChangeStatus,
  });

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        applySessionPatchesToList();
        void refresh();
      }
    }, [applySessionPatchesToList, isAuthorized, refresh]),
  );

  const showSkeletonList = isLoading && reviews.length === 0 && !error;
  const emptyState = getAdminReviewsEmptyStateMessage(statusFilter, listTab);

  const renderItem = useCallback(
    ({ item }: { item: AdminReviewListItem }) => (
      <AdminReviewCard
        review={item}
        listTab={listTab}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={Boolean(item._id && updatingReviewId === item._id)}
      />
    ),
    [handleView, listTab, openMenu, updatingReviewId],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by customer, product, or review..."
        accessibilityLabel="Search reviews by customer, product, or review text"
      />

      <AdminReviewTypeTabs activeTab={listTab} onTabChange={applyListTab} />

      {listTab === 'customer' ? (
        <AdminReviewStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />
      ) : null}

      {reviews.length > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {filteredReviews.length} matching · {reviews.length} total
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

      {error && reviews.length > 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {showSkeletonList ? (
        <View style={styles.skeletonList}>
          {SKELETON_ITEMS.map((key) => (
            <AdminReviewCardSkeleton key={key} />
          ))}
        </View>
      ) : isLoading && reviews.length === 0 && !error ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading reviews...
          </AppText>
        </View>
      ) : null}
    </View>
  );

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
          paginatedReviews.length === 0 && styles.emptyContent,
        ]}
        data={showSkeletonList ? [] : paginatedReviews}
        keyExtractor={(item, index) => item._id ?? `admin-review-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          paginatedReviews.length > 0 ? (
            <OrderListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              isLoading={isLoading}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          ) : null
        }
        ListEmptyComponent={
          !showSkeletonList && !isLoading && !error ? (
            <EmptyState
              title={emptyState.title}
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or filter tabs.'
                  : emptyState.message
              }
            />
          ) : error && reviews.length === 0 ? (
            <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
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

      <AdminProductCardActionsMenu
        visible={Boolean(menuReview)}
        productName={menuReview ? getAdminReviewMenuTitle(menuReview) : undefined}
        actions={menuActions}
        onClose={closeMenu}
        onSelect={handleMenuAction}
      />

      <AdminReviewStatusSheet
        visible={Boolean(statusRow)}
        currentStatus={statusRow?.reviewStatus ?? 'Pending'}
        isUpdating={Boolean(statusRow && updatingReviewId === statusRow._id)}
        onDismiss={() => setStatusRow(null)}
        onApply={(nextStatus) => {
          if (!statusRow?._id) {
            return;
          }

          void updateStatus(statusRow._id, nextStatus).then((updated) => {
            if (updated) {
              setStatusRow(null);
            }
          });
        }}
        onClearError={clearActionError}
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
    marginTop: 0,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonList: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
