import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { AdminReviewCardSkeleton } from '../../../admin/reviews/components/AdminReviewCardSkeleton';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerReviewCard } from '../components/SellerReviewCard';
import { SellerReviewReplyTabs } from '../components/SellerReviewReplyTabs';
import { SellerReviewStatusTabs } from '../components/SellerReviewStatusTabs';
import { useSellerReviews } from '../hooks/useSellerReviews';
import { navigateToSellerReviewDetail } from '../navigation/sellerReviewsNavigation';
import type { SellerReviewListItem } from '../types/sellerReview';
import { getSellerReviewsEmptyStateMessage } from '../utils/sellerReviewListDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerReviews'>;

const REVIEWS_RETURN_TO = authReturnTo.sellerReviews();
const SKELETON_ITEMS = ['r1', 'r2', 'r3'] as const;

export function SellerReviewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(REVIEWS_RETURN_TO);

  const {
    reviews,
    rawReviewCount,
    currentPage,
    totalPages,
    statusFilter,
    replyFilter,
    searchInput,
    setSearchInput,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    error,
    setStatusFilter,
    setReplyFilter,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useSellerReviews(isAuthorized ? sellerId : undefined);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  const handlePressReview = useCallback(
    (review: SellerReviewListItem) => {
      if (!review._id) {
        return;
      }

      navigateToSellerReviewDetail(navigation, review._id, review);
    },
    [navigation],
  );

  const showSkeletonList = isLoading && rawReviewCount === 0 && !error;
  const emptyState = getSellerReviewsEmptyStateMessage(statusFilter, replyFilter);

  const renderItem = useCallback(
    ({ item }: { item: SellerReviewListItem }) => (
      <SellerReviewCard review={item} onPress={handlePressReview} />
    ),
    [handlePressReview],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by customer, product, or review..."
        accessibilityLabel="Search reviews by customer, product, or review text"
      />

      <SellerReviewReplyTabs activeFilter={replyFilter} onFilterChange={setReplyFilter} />
      <SellerReviewStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      {rawReviewCount > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {reviews.length} on this page · Page {currentPage} of {totalPages}
        </AppText>
      ) : null}

      {error && rawReviewCount > 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {showSkeletonList ? (
        <View style={styles.skeletonList}>
          {SKELETON_ITEMS.map((key) => (
            <AdminReviewCardSkeleton key={key} />
          ))}
        </View>
      ) : null}
    </View>
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        reviews.length === 0 && styles.emptyContent,
      ]}
      data={showSkeletonList ? [] : reviews}
      keyExtractor={(item, index) => item._id ?? `seller-review-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListFooterComponent={
        rawReviewCount > 0 ? (
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
                ? 'Try adjusting your search or filter tabs on this page.'
                : emptyState.message
            }
          />
        ) : error && rawReviewCount === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
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
  skeletonList: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
