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
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCommissionCard } from '../components/AdminCommissionCard';
import { AdminCommissionFilters } from '../components/AdminCommissionFilters';
import { AdminCommissionStatusSheet } from '../components/AdminCommissionStatusSheet';
import { AdminCommissionSummary } from '../components/AdminCommissionSummary';
import { useAdminCommissionList } from '../hooks/useAdminCommissionList';
import type {
  AdminCommissionActionError,
  AdminCommissionDisplayRow,
} from '../types/adminCommission';
import {
  formatAdminCommissionPayoutStatusLabel,
  formatAdminCommissionRecipientRoleLabel,
} from '../utils/adminCommissionFilterOptions';
import { canInitiateAdminCommissionPayout } from '../utils/adminCommissionMutationGuards';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCommission'>;

export function AdminCommissionScreen({ route }: Props) {
  const params = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminCommission(params);
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(returnTo);
  const [filtersVisible, setFiltersVisible] = useState(false);
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
    clearFilters,
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

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];

    if (payoutStatusFilter) {
      parts.push(`Status: ${formatAdminCommissionPayoutStatusLabel(payoutStatusFilter)}`);
    }

    if (roleFilter) {
      parts.push(`Role: ${formatAdminCommissionRecipientRoleLabel(roleFilter)}`);
    }

    return parts.join(' · ');
  }, [payoutStatusFilter, roleFilter]);

  const handleInitiatePress = useCallback(
    (row: AdminCommissionDisplayRow) => {
      if (!canInitiateAdminCommissionPayout(row, initiatingCommissionId)) {
        return;
      }

      clearActionError();

      Alert.alert(
        'Initiate Korapay payout?',
        `Send a payout link email for ${row.recipientName} (${row.orderDisplayId})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send link',
            onPress: () => {
              void initiatePayout(row);
            },
          },
        ],
      );
    },
    [clearActionError, initiatePayout, initiatingCommissionId],
  );

  const handleStatusPress = useCallback(
    (row: AdminCommissionDisplayRow) => {
      clearActionError();
      setStatusRow(row);
    },
    [clearActionError],
  );

  const handleRetryAction = useCallback(
    (row: AdminCommissionDisplayRow, kind: AdminCommissionActionError['kind']) => {
      clearActionError();

      if (kind === 'initiate') {
        handleInitiatePress(row);
        return;
      }

      setStatusRow(row);
    },
    [clearActionError, handleInitiatePress],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminCommissionDisplayRow }) => (
      <AdminCommissionCard
        row={item}
        initiatingCommissionId={initiatingCommissionId}
        updatingStatusCommissionId={updatingStatusCommissionId}
        actionError={actionError}
        onInitiatePress={handleInitiatePress}
        onStatusPress={handleStatusPress}
        onRetryAction={handleRetryAction}
        onDismissActionError={clearActionError}
      />
    ),
    [
      actionError,
      clearActionError,
      handleInitiatePress,
      handleRetryAction,
      handleStatusPress,
      initiatingCommissionId,
      updatingStatusCommissionId,
    ],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.titleBlock}>
        <AppText variant="h3">Commission</AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {totalCommissions} {totalCommissions === 1 ? 'commission record' : 'commission records'}
        </AppText>
      </View>

      <AdminCommissionSummary
        totalCommissionAmount={totalCommissionAmount}
        summaryError={summaryError}
        onRetrySummary={() => void retrySummary()}
      />

      <SearchBar
        mode="input"
        placeholder="Search commission or order..."
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

      {error && displayRows.length > 0 ? (
        <ErrorState
          message={error}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.inlineError}
        />
      ) : null}

      {isLoading && displayRows.length === 0 && !error ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading commissions...
          </AppText>
        </View>
      ) : null}
    </View>
  );

  const listFooter =
    displayRows.length > 0 ? (
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

  if (isGateLoading || !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && displayRows.length === 0) {
    return (
      <View style={[styles.screen, styles.blockingError, { paddingTop: insets.top + spacing.lg }]}>
        <ErrorState message={error} actionLabel="Retry" onAction={() => void refresh()} />
      </View>
    );
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
        data={displayRows}
        keyExtractor={(item) => item.rowKey}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="No commissions found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or filters.'
                  : 'Commission records will appear here once orders generate payouts.'
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

      <AdminCommissionFilters
        visible={filtersVisible}
        payoutStatusFilter={payoutStatusFilter}
        roleFilter={roleFilter}
        onClose={() => setFiltersVisible(false)}
        onApply={(nextPayoutStatus, nextRole) => {
          applyPayoutStatusFilter(nextPayoutStatus);
          applyRoleFilter(nextRole);
        }}
        onClear={() => {
          clearFilters();
          setFiltersVisible(false);
        }}
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
  blockingError: {
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    gap: spacing.md,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clearFilters: {
    paddingVertical: spacing.xs,
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
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
