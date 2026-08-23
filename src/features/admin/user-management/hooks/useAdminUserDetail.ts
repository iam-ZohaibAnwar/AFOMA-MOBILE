import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { ApiError, getErrorMessage } from '../../../../services/api/errors';
import { getAdminUserById } from '../api/adminUserManagementApi';
import type { AdminUserListItem } from '../types/adminUserManagement';
import { applyAdminUserSessionPatch, clearAdminUserSessionPatch, setAdminUserSessionPatch } from '../state/adminUserSessionPatch';

export function useAdminUserDetail(userId: string | undefined, initialUser?: AdminUserListItem) {
  const [user, setUser] = useState<AdminUserListItem | null>(
    applyAdminUserSessionPatch(initialUser ?? null) ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(userId) && !initialUser);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const requestVersionRef = useRef(0);
  const hasCachedUserRef = useRef(Boolean(initialUser?._id && initialUser._id === userId));

  useEffect(() => {
    hasCachedUserRef.current = Boolean(initialUser?._id && initialUser._id === userId);
    if (hasCachedUserRef.current && initialUser) {
      setUser(applyAdminUserSessionPatch(initialUser) ?? initialUser);
    } else if (!initialUser) {
      setUser(null);
    }
    setError(null);
    setIsNotFound(false);
    setIsLoading(Boolean(userId) && !hasCachedUserRef.current);
  }, [initialUser, userId]);

  const loadUser = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!userId) {
        setUser(null);
        setError(null);
        setIsNotFound(false);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedUserRef.current) {
        setIsLoading(true);
      }

      setError(null);
      setIsNotFound(false);

      try {
        const response = await getAdminUserById(userId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applyAdminUserSessionPatch(response) ?? response;
        setUser(merged);
        hasCachedUserRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const notFound = err instanceof ApiError && err.statusCode === 404;
        setIsNotFound(notFound);

        if (notFound && userId) {
          clearAdminUserSessionPatch(userId);
        }

        if (!hasCachedUserRef.current) {
          setUser(null);
        }

        setError(notFound ? 'User not found.' : getErrorMessage(err, 'Failed to load user'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    void loadUser(hasCachedUserRef.current ? 'refresh' : 'initial');
  }, [loadUser]);

  const refresh = useCallback(async () => {
    await loadUser('refresh');
  }, [loadUser]);

  const syncSessionPatch = useCallback(() => {
    setUser((current) => applyAdminUserSessionPatch(current) ?? current);
  }, []);

  const applyUserUpdate = useCallback(
    (updatedUser: AdminUserListItem) => {
      if (!userId) {
        return;
      }

      setAdminUserSessionPatch(userId, updatedUser);
      setUser(updatedUser);
    },
    [userId],
  );

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  return {
    user,
    isLoading,
    isRefreshing,
    error,
    isNotFound,
    refresh,
    syncSessionPatch,
    applyUserUpdate,
  };
}
