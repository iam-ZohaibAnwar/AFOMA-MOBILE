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
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminUserCard } from '../components/AdminUserCard';
import { AdminUserCardSkeleton } from '../components/AdminUserCardSkeleton';
import { AdminUserFilterTabs } from '../components/AdminUserFilterTabs';
import { useAdminUserCardActions } from '../hooks/useAdminUserCardActions';
import { useAdminUserList } from '../hooks/useAdminUserList';
import type { AdminUserListItem } from '../types/adminUserManagement';
import { formatAdminUserDisplayName } from '../utils/adminUserRoleOptions';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserManagement'>;

const LIST_RETURN_TO = authReturnTo.adminUserManagement();
const SKELETON_ITEMS = ['u1', 'u2', 'u3'] as const;

export function AdminUserManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(LIST_RETURN_TO);

  const {
    users,
    currentPage,
    totalPages,
    totalUsers,
    isLoading,
    isRefreshing,
    error,
    searchInput,
    setSearchInput,
    roleFilter,
    hasActiveFilters,
    applyRoleFilter,
    actionError,
    clearActionError,
    reportActionError,
    deletingUserId,
    refresh,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    deleteUser,
  } = useAdminUserList(isAuthorized);

  const {
    menuUser,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleView,
    busyUserId,
  } = useAdminUserCardActions(navigation, {
    deleteUser,
    deletingUserId,
    reportActionError,
  });

  const showSkeletonList = isLoading && users.length === 0 && !error;

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItem }) => (
      <AdminUserCard
        user={item}
        onPress={handleView}
        onMenuPress={openMenu}
        isBusy={Boolean(item._id && busyUserId === item._id)}
      />
    ),
    [busyUserId, handleView, openMenu],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <OrderListSearchBar
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Search by name, email, or phone..."
        accessibilityLabel="Search users by name, email, or phone"
      />

      <AdminUserFilterTabs roleFilter={roleFilter} onSelect={applyRoleFilter} />

      {totalUsers > 0 ? (
        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
          {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
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

      {error && users.length === 0 && !showSkeletonList ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {error && users.length > 0 ? (
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
    users.length > 0 ? (
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
          renderItem={() => <AdminUserCardSkeleton />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={listHeader}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create user"
          onPress={() => navigation.navigate('AdminUserForm', { mode: 'create' })}
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
          users.length === 0 && styles.emptyContent,
        ]}
        data={users}
        keyExtractor={(item, index) => item._id ?? `admin-user-${index}`}
        renderItem={renderItem}
        extraData={busyUserId}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading && !error ? (
            <EmptyState
              title="No users found"
              message={
                hasActiveFilters || searchInput.trim()
                  ? 'Try adjusting your search or role filter.'
                  : 'Users will appear here once they are registered.'
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
        accessibilityLabel="Create user"
        onPress={() => navigation.navigate('AdminUserForm', { mode: 'create' })}
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </Pressable>

      <AdminProductCardActionsMenu
        visible={Boolean(menuUser)}
        productName={menuUser ? formatAdminUserDisplayName(menuUser) : undefined}
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
