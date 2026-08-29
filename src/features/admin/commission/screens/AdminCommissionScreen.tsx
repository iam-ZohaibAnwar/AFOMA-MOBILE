import { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { OrderListPagination } from '../../../orders/components/OrderListPagination';
import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCommissionCard } from '../components/AdminCommissionCard';
import { AdminProductCardActionsMenu } from '../../product-management/components/AdminProductCardActionsMenu';
import { AdminCommissionCardSkeleton } from '../components/AdminCommissionCardSkeleton';
import { AdminCommissionPayoutStatusTabs } from '../components/AdminCommissionPayoutStatusTabs';
import { AdminCommissionRoleTabs } from '../components/AdminCommissionRoleTabs';
import { AdminCommissionStatusSheet } from '../components/AdminCommissionStatusSheet';
import { AdminCommissionSummary } from '../components/AdminCommissionSummary';
import { useAdminCommissionCardActions } from '../hooks/useAdminCommissionCardActions';
import { useAdminCommissionList } from '../hooks/useAdminCommissionList';
import type { AdminCommissionDisplayRow } from '../types/adminCommission';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCommission'>;

const SKELETON_ITEMS = ['c1', 'c2', 'c3'] as const;

export function AdminCommissionScreen({ navigation, route }: Props) {
  const params = route.params;
  const insets = useSafeAreaInsets();
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(
    authReturnTo.adminCommission(params),
  );
  const [statusRow, setStatusRow] = useState<AdminCommissionDisplayRow | null>(null);

  const {
    displayRows,
    currentPage,
    totalPages,
    totalCommissions,
    totalCommissionAmount,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    searchInput,
    setSearchInput,
    payoutStatusFilter,
    roleFilter,
    hasActiveFilters,
    applyPayoutStatusFilter,
    applyRoleFilter,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    initiatingCommissionId,
    updatingStatusCommissionId,
    actionError,
    clearActionError,
    initiatePayout,
    updatePayoutStatus,
  } = useAdminCommissionList(isAuthorized, params);

  const {
    menuRow,
    menuActions,
    menuTitle,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
    busyCommissionId,
  } = useAdminCommissionCardActions(navigation, {
    initiatingCommissionId,
    updatingStatusCommissionId,
    onInitiatePayout: (row) => {
      void initiatePayout(row);
    },
    onChangeStatus: (row) => {
      clearActionError();
      setStatusRow(row);
    },
  });

  const showSkeletonList = isLoading && displayRows.length === 0 && !error;

  const renderItem = useCallback(
    ({ item }: { item: AdminCommissionDisplayRow }) => (
      <AdminCommissionCard
        row={item}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={busyCommissionId === item.commissionId}
      />
    ),
    [busyCommissionId, handleView, openMenu],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <AdminCommissionSummary
        totalCommissionAmount={totalCommissionAmount}
        summaryError={summaryError}
        onRetrySummary={() => void retrySummary()}
      />

      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by seller or recipient name..."
        accessibilityLabel="Search commissions by seller or recipient name"
      />

      <AdminCommissionPayoutStatusTabs
        activeStatus={payoutStatusFilter}
        onStatusChange={applyPayoutStatusFilter}
      />

      <AdminCommissionRoleTabs activeRole={roleFilter} onRoleChange={applyRoleFilter} />

      {totalCommissions > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalCommissions} {totalCommissions === 1 ? 'record' : 'records'}
        </AppText>
      ) : null}

      {actionError ? (
        <ErrorState
          message={actionError.message}
          actionLabel="Dismiss"
          onAction={clearActionError}
          style={styles.inlineError}
        />
      ) : null}

      {error && displayRows.length > 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {showSkeletonList ? (
        <View style={styles.skeletonList}>
          {SKELETON_ITEMS.map((key) => (
            <AdminCommissionCardSkeleton key={key} />
          ))}
        </View>
      ) : null}
    </View>
  );

  if (isGateLoading || !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
          displayRows.length === 0 && styles.emptyContent,
        ]}
        data={showSkeletonList ? [] : displayRows}
        keyExtractor={(item) => item.rowKey}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          displayRows.length > 0 ? (
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
              title="No commissions found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or filter tabs.'
                  : 'Commission records will appear here once orders generate payouts.'
              }
            />
          ) : error && displayRows.length === 0 ? (
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
        visible={Boolean(menuRow)}
        productName={menuTitle}
        actions={menuActions}
        onClose={closeMenu}
        onSelect={handleMenuAction}
      />

      <AdminCommissionStatusSheet
        visible={Boolean(statusRow)}
        currentStatus={statusRow?.payoutStatus ?? 'Pending'}
        isUpdating={Boolean(statusRow && updatingStatusCommissionId === statusRow.commissionId)}
        onClose={() => setStatusRow(null)}
        onApply={(nextStatus) => {
          if (!statusRow) {
            return;
          }

          void updatePayoutStatus(statusRow, nextStatus).then((success) => {
            if (success) {
              setStatusRow(null);
            }
          });
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
