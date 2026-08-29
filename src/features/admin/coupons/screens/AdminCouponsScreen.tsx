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
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { AdminProductCardActionsMenu } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCouponCard } from '../components/AdminCouponCard';
import { AdminCouponCardSkeleton } from '../components/AdminCouponCardSkeleton';
import { AdminCouponScopeTabs } from '../components/AdminCouponScopeTabs';
import { AdminCouponStatusTabs } from '../components/AdminCouponStatusTabs';
import {
  useAdminCouponCardActions,
  useAdminCouponList,
} from '../hooks/useAdminCoupons';
import type { AdminCouponListItem } from '../types/adminCoupons';
import { navigateToAdminCouponForm } from '../navigation/adminCouponsNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCoupons'>;

const RETURN_TO = authReturnTo.adminCoupons();
const SKELETON_ITEMS = ['c1', 'c2', 'c3'] as const;

export function AdminCouponsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const adminUserId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [notice, setNotice] = useState<string | null>(route.params?.notice ?? null);

  const {
    coupons,
    filteredCount,
    listTab,
    setListTab,
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
    notifyingCouponId,
    error,
    actionError,
    refresh,
    clearActionError,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    deleteCoupon,
    notifyCoupon,
  } = useAdminCouponList({
    adminUserId: isAuthorized ? adminUserId : undefined,
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
  } = useAdminCouponCardActions(navigation, {
    listTab,
    deletingCouponId,
    notifyingCouponId,
    onDeleteCoupon: deleteCoupon,
    onNotifyCoupon: notifyCoupon,
    onListChanged: () => {},
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
    navigateToAdminCouponForm(navigation);
  }, [navigation]);

  const showAddFab = listTab === 'admin';
  const listBottomInset = insets.bottom + spacing.xxl + (showAddFab ? 72 : 0);

  const renderItem = useCallback(
    ({ item }: { item: AdminCouponListItem }) => (
      <AdminCouponCard
        coupon={item}
        listTab={listTab}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={busyCouponId === item._id}
      />
    ),
    [busyCouponId, handleView, listTab, openMenu],
  );

  const showSkeletonList = isLoading && coupons.length === 0 && !error;

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by code, seller, or description..."
        accessibilityLabel="Search coupons"
      />

      <AdminCouponScopeTabs activeTab={listTab} onTabChange={setListTab} />
      <AdminCouponStatusTabs activeStatus={statusFilter} onStatusChange={setStatusFilter} />

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
    : listTab === 'admin'
      ? 'Create a coupon to offer discounts on the marketplace.'
      : 'Seller-created coupons will appear here.';

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

      {showAddFab ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create coupon"
          onPress={handleAddCoupon}
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        >
          <Ionicons name="add" size={28} color={colors.textInverse} />
        </Pressable>
      ) : null}

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
