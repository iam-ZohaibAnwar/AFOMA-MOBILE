import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerReviewCard } from '../components/SellerReviewCard';
import { useSellerReviews } from '../hooks/useSellerReviews';
import type { SellerReviewListItem } from '../types/sellerReview';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerReviews'>;

const REVIEWS_RETURN_TO = authReturnTo.sellerReviews();

export function SellerReviewsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(REVIEWS_RETURN_TO);

  const {
    reviews,
    currentPage,
    totalPages,
    isLoading,
    isRefreshing,
    error,
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

  const renderItem = useCallback(
    ({ item }: { item: SellerReviewListItem }) => (
      <SellerReviewCard
        review={item}
        onPress={
          item._id
            ? () =>
                navigation.navigate('SellerReviewDetail', {
                  reviewId: item._id!,
                  initialReview: item,
                })
            : undefined
        }
      />
    ),
    [navigation],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <AppText variant="bodyMedium" style={styles.sectionTitle}>
        All Reviews
      </AppText>

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {isLoading && reviews.length === 0 ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading reviews...
          </AppText>
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    reviews.length > 0 ? (
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
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
        reviews.length === 0 && styles.emptyContent,
      ]}
      data={reviews}
      keyExtractor={(item, index) => item._id ?? `seller-review-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      ListEmptyComponent={
        !isLoading && !error ? (
          <EmptyState title="No Reviews added." message="Customer reviews will appear here." />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerContent: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inlineError: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
