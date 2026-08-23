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
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminUserCard } from '../components/AdminUserCard';
import { AdminUserRoleFilterSheet } from '../components/AdminUserRoleFilterSheet';
import { useAdminUserList } from '../hooks/useAdminUserList';
import type { AdminUserListItem } from '../types/adminUserManagement';
import { formatAdminUserDisplayName, formatAdminUserRoleLabel } from '../utils/adminUserRoleOptions';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserManagement'>;

const RETURN_TO = authReturnTo.adminUserManagement();

export function AdminUserManagementScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(RETURN_TO);
  const [filtersVisible, setFiltersVisible] = useState(false);

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
    clearRoleFilter,
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

  const activeFilterSummary = useMemo(() => {
    if (!roleFilter) {
      return '';
    }

    return `Role: ${formatAdminUserRoleLabel(roleFilter)}`;
  }, [roleFilter]);

  const handleViewPress = useCallback(
    (user: AdminUserListItem) => {
      if (!user._id) {
        return;
      }

      navigation.navigate('AdminUserDetail', {
        userId: user._id,
        initialUser: user,
      });
    },
    [navigation],
  );

  const handleEditPress = useCallback(
    (user: AdminUserListItem) => {
      if (!user._id) {
        return;
      }

      navigation.navigate('AdminUserForm', {
        userId: user._id,
        mode: 'edit',
        initialUser: user,
      });
    },
    [navigation],
  );

  const handleDeletePress = useCallback(
    (user: AdminUserListItem) => {
      if (!user._id) {
        return;
      }

      if (deletingUserId) {
        reportActionError('Another delete is already in progress.');
        return;
      }

      clearActionError();

      Alert.alert(
        'Delete user?',
        `This will permanently remove ${formatAdminUserDisplayName(user)}. This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void deleteUser(user._id);
            },
          },
        ],
      );
    },
    [clearActionError, deleteUser, deletingUserId, reportActionError],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItem }) => (
      <AdminUserCard
        user={item}
        isDeleting={deletingUserId === item._id}
        isDeleteBusy={Boolean(deletingUserId)}
        onViewPress={handleViewPress}
        onEditPress={handleEditPress}
        onDeletePress={handleDeletePress}
      />
    ),
    [deletingUserId, handleDeletePress, handleEditPress, handleViewPress],
  );

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <AppText variant="h3">User Management</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {totalUsers} {totalUsers === 1 ? 'user' : 'users'}
            </AppText>
          </View>
          <AppButton
            label="Add user"
            variant="outline"
            onPress={() => navigation.navigate('AdminUserForm', { mode: 'create' })}
          />
        </View>
      </View>

      <SearchBar
        mode="input"
        placeholder="Search by user name..."
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
          <Pressable accessibilityRole="button" onPress={clearRoleFilter} style={styles.clearFilters}>
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
        <ErrorState
          message={error}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.inlineError}
        />
      ) : null}

      {isLoading && users.length === 0 && !error ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading users...
          </AppText>
        </View>
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

  return (
    <>
      <FlatList
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xxl },
          users.length === 0 && styles.emptyContent,
        ]}
        data={users}
        keyExtractor={(item, index) => item._id ?? `admin-user-${index}`}
        renderItem={renderItem}
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
      />

      <AdminUserRoleFilterSheet
        visible={filtersVisible}
        roleFilter={roleFilter}
        onClose={() => setFiltersVisible(false)}
        onApply={applyRoleFilter}
        onClear={() => {
          clearRoleFilter();
          setFiltersVisible(false);
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
