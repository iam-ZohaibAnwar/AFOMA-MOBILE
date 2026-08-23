import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  ADMIN_USER_LIST_PAGE_SIZE,
  deleteAdminUser,
  getAdminUserList,
} from '../api/adminUserManagementApi';
import type { AdminUserListItem, AdminUserRoleFilter } from '../types/adminUserManagement';
import { consumeAdminUserListRefreshRequest, requestAdminUserListRefresh } from '../state/adminUserListRefresh';
import {
  applyAdminUserSessionPatch,
  clearAdminUserSessionPatch,
  peekAdminUserSessionPatches,
} from '../state/adminUserSessionPatch';

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminUserList(enabled: boolean) {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const requestVersionRef = useRef(0);
  const hasCachedUsersRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setUsers([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedUsersRef.current) {
        setIsLoading(true);
      }

      setError(null);

      try {
        let resolvedPage = page;
        let response = await getAdminUserList({
          page: resolvedPage,
          limit: ADMIN_USER_LIST_PAGE_SIZE,
          search: searchTerm || undefined,
          role: roleFilter || undefined,
        });

        const maxPage = Math.max(1, response.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          response = await getAdminUserList({
            page: resolvedPage,
            limit: ADMIN_USER_LIST_PAGE_SIZE,
            search: searchTerm || undefined,
            role: roleFilter || undefined,
          });
        }

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const nextUsers = Array.isArray(response.users) ? response.users : [];
        setUsers(nextUsers.map((user) => applyAdminUserSessionPatch(user) ?? user));
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setTotalUsers(response.totalUsers ?? 0);
        setCurrentPage(resolvedPage);
        hasCachedUsersRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!hasCachedUsersRef.current) {
          setUsers([]);
        }
        setError(getErrorMessage(err, 'Failed to load users'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled, roleFilter, searchTerm],
  );

  useEffect(() => {
    setCurrentPage(1);
    void loadPage(1, hasCachedUsersRef.current ? 'refresh' : 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(currentPage, 'refresh');
  }, [currentPage, loadPage]);

  const goToPreviousPage = useCallback(() => {
    const nextPage = Math.max(1, currentPage - 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadPage(nextPage, 'initial');
  }, [currentPage, loadPage]);

  const goToNextPage = useCallback(() => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    if (nextPage === currentPage) {
      return;
    }
    void loadPage(nextPage, 'initial');
  }, [currentPage, loadPage, totalPages]);

  const applyRoleFilter = useCallback((nextRole: AdminUserRoleFilter) => {
    setRoleFilter(nextRole);
  }, []);

  const clearRoleFilter = useCallback(() => {
    setRoleFilter('');
  }, []);

  const hasActiveFilters = useMemo(() => Boolean(roleFilter), [roleFilter]);

  const deleteUser = useCallback(
    async (userId: string) => {
      if (deletingUserId) {
        return false;
      }

      setActionError(null);
      setDeletingUserId(userId);

      const wasOnlyUserOnPage = users.length === 1;
      const pageBeforeDelete = currentPage;

      try {
        await deleteAdminUser(userId);
        clearAdminUserSessionPatch(userId);

        if (wasOnlyUserOnPage && pageBeforeDelete > 1) {
          await loadPage(pageBeforeDelete - 1, 'initial');
        } else {
          await loadPage(pageBeforeDelete, 'refresh');
        }

        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to delete user'));
        return false;
      } finally {
        setDeletingUserId(null);
      }
    },
    [currentPage, deletingUserId, loadPage, users.length],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const reportActionError = useCallback((message: string) => {
    setActionError(message);
  }, []);

  const applySessionPatchesToList = useCallback(() => {
    const patches = peekAdminUserSessionPatches();
    if (patches.size === 0) {
      return;
    }

    setUsers((current) =>
      current.map((user) => {
        const patch = patches.get(user._id);
        return patch ? { ...user, ...patch } : user;
      }),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      applySessionPatchesToList();
      const { refresh: shouldRefresh, resetToFirstPage } = consumeAdminUserListRefreshRequest();
      if (shouldRefresh) {
        void loadPage(resetToFirstPage ? 1 : currentPage, resetToFirstPage ? 'initial' : 'refresh');
      }
    }, [applySessionPatchesToList, currentPage, loadPage]),
  );

  return {
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
    canGoPrevious: currentPage > 1 && !isLoading && !deletingUserId,
    canGoNext: currentPage < totalPages && !isLoading && !deletingUserId,
    deleteUser,
  };
}
