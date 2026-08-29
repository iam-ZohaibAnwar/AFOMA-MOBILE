import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { AdminCouponCardSkeleton } from '../../../admin/coupons/components/AdminCouponCardSkeleton';
import { AdminProductCardActionsMenu } from '../../../admin/product-management/components/AdminProductCardActionsMenu';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerCouponCard } from '../components/SellerCouponCard';
import { SellerCouponStatusTabs } from '../components/SellerCouponStatusTabs';
import {
  useSellerCouponCardActions,
  useSellerCouponList,
} from '../hooks/useSellerCoupons';
import type { SellerCoupon } from '../types/sellerCoupon';
import { navigateToSellerCouponForm } from '../navigation/sellerCouponsNavigation';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerCoupons'>;

const RETURN_TO = authReturnTo.sellerCoupons();
const SKELETON_ITEMS = ['c1', 'c2', 'c3'] as const;

export function SellerCouponsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireSeller(RETURN_TO);
  const [notice, setNotice] = useState<string | null>(route.params?.notice ?? null);

  const {
    coupons,
    filteredCount,
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    currentPage,
    totalPages,
    hasActiveFilters,
    isLoading,
    isRefreshing,
    deletingCouponId,
    error,
    actionError,
    refresh,
    clearActionError,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    deleteCoupon,
  } = useSellerCouponList({
    userId: isAuthorized ? userId : undefined,
    enabled: isAuthorized,
  });

  const {
    menuCoupon,
    menuActions,
    menuTitle,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
    busyCouponId,
  } = useSellerCouponCardActions(navigation, {
    deletingCouponId,
    onDeleteCoupon: deleteCoupon,
  });

  useEffect(() => {
    if (route.params?.notice) {
      setNotice(route.params.notice);
      navigation.setParams({ notice: undefined });
    }
  }, [navigation, route.params?.notice]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

  const handleAddCoupon = useCallback(() => {
    navigateToSellerCouponForm(navigation);
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: SellerCoupon }) => (
      <SellerCouponCard
        coupon={item}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={busyCouponId === item._id}
      />
    ),
    [busyCouponId, handleView, openMenu],
  );

  const showSkeletonList = isLoading && coupons.length === 0 && !error;
  const listBottomInset = insets.bottom + spacing.xxl + 72;

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by code or description..."
        accessibilityLabel="Search coupons"
      />

      <SellerCouponStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

      {notice ? (
        <AppCard variant="flat" style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {notice}
          </AppText>
        </AppCard>
      ) : null}

      {actionError ? (
        <ErrorState
          message={actionError}
          onAction={clearActionError}
          actionLabel="Dismiss"
          style={styles.inlineError}
        />
      ) : null}

      {error && coupons.length > 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {filteredCount > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {filteredCount} {filteredCount === 1 ? 'coupon' : 'coupons'}
        </AppText>
      ) : null}

      {showSkeletonList ? (
        <View style={styles.skeletonList}>
          {SKELETON_ITEMS.map((key) => (
            <AdminCouponCardSkeleton key={key} />
          ))}
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    filteredCount > 0 ? (
      <OrderListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
      />
    ) : null;

  const emptyMessage = hasActiveFilters
    ? 'No coupons match your current search or filters.'
    : 'Create a coupon to offer discounts to your customers.';

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: listBottomInset },
          filteredCount === 0 && !showSkeletonList && styles.emptyContent,
        ]}
        data={showSkeletonList ? [] : coupons}
        keyExtractor={(item, index) => item._id ?? `coupon-${index}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          showSkeletonList ? null : error && filteredCount === 0 ? (
            <ErrorState message={error} onAction={() => void refresh()} style={styles.emptyState} />
          ) : (
            <EmptyState
              title={hasActiveFilters ? 'No matching coupons' : 'No coupons yet'}
              message={emptyMessage}
              style={styles.emptyState}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create coupon"
        onPress={handleAddCoupon}
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </Pressable>

      <AdminProductCardActionsMenu
        visible={Boolean(menuCoupon)}
        productName={menuTitle}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  countText: {
    marginTop: -spacing.xs,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successSoft,
  },
  inlineError: {
    marginBottom: 0,
  },
  skeletonList: {
    gap: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
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
