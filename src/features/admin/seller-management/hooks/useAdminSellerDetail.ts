import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getAdminSellerById } from '../api/adminSellerManagementApi';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import {
  applyAdminSellerSessionPatch,
  setAdminSellerSessionPatch,
} from '../state/adminSellerSessionPatch';

export function useAdminSellerDetail(
  sellerId: string | undefined,
  initialSeller?: AdminSellerListItem,
) {
  const [seller, setSeller] = useState<AdminSellerListItem | null>(
    applyAdminSellerSessionPatch(initialSeller ?? null) ?? null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(sellerId) && !initialSeller);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestVersionRef = useRef(0);
  const hasCachedSellerRef = useRef(Boolean(initialSeller));

  useEffect(() => {
    hasCachedSellerRef.current = Boolean(initialSeller);
    if (initialSeller) {
      setSeller(applyAdminSellerSessionPatch(initialSeller) ?? initialSeller);
    } else {
      setSeller(null);
    }
    setError(null);
    setIsLoading(Boolean(sellerId) && !initialSeller);
  }, [initialSeller, sellerId]);

  const loadSeller = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!sellerId) {
        setSeller(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedSellerRef.current) {
        setIsLoading(true);
      }

      setError(null);

      try {
        const response = await getAdminSellerById(sellerId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const merged = applyAdminSellerSessionPatch(response) ?? response;
        setSeller(merged);
        hasCachedSellerRef.current = true;
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!hasCachedSellerRef.current) {
          setSeller(null);
        }
        setError(getErrorMessage(err, 'Failed to load seller'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [sellerId],
  );

  useEffect(() => {
    void loadSeller(hasCachedSellerRef.current ? 'refresh' : 'initial');
  }, [loadSeller]);

  const refresh = useCallback(async () => {
    await loadSeller('refresh');
  }, [loadSeller]);

  const syncSessionPatch = useCallback(() => {
    setSeller((current) => applyAdminSellerSessionPatch(current) ?? current);
  }, []);

  const applySellerUpdate = useCallback(
    (patch: Partial<AdminSellerListItem>) => {
      if (!sellerId) {
        return;
      }

      setAdminSellerSessionPatch(sellerId, patch);
      setSeller((current) => (current ? { ...current, ...patch } : current));
    },
    [sellerId],
  );

  return {
    seller,
    isLoading,
    isRefreshing,
    error,
    refresh,
    syncSessionPatch,
    applySellerUpdate,
  };
}
