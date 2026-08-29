import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  deleteAdminShippingConfig,
  getAdminShippingConfig,
  saveAdminShippingConfig,
} from '../api/adminShippingConfigApi';
import type {
  AdminShippingConfigDocument,
  AdminShippingMatrixMap,
  AdminShippingTierDraft,
} from '../types/adminShippingConfig';
import {
  buildShippingConfigSavePayload,
  mapApiMatrixToUiMap,
  migrateMatrixForTierChange,
  rebuildMatrixForTiers,
} from '../utils/adminShippingConfigMappers';
import { getErrorMessage } from '../../../../services/api/errors';

interface UseAdminShippingConfigEditorOptions {
  enabled: boolean;
}

export function useAdminShippingConfigEditor({ enabled }: UseAdminShippingConfigEditorOptions) {
  const [configId, setConfigId] = useState<string | null>(null);
  const [tiers, setTiers] = useState<AdminShippingTierDraft[]>([]);
  const [matrix, setMatrix] = useState<AdminShippingMatrixMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const tiersRef = useRef(tiers);
  const matrixRef = useRef(matrix);
  const configIdRef = useRef(configId);

  tiersRef.current = tiers;
  matrixRef.current = matrix;
  configIdRef.current = configId;

  const applyLoadedConfig = useCallback((document: AdminShippingConfigDocument | null) => {
    if (!document?.tiers?.length) {
      setConfigId(document?._id ?? null);
      setTiers([]);
      setMatrix({});
      return;
    }

    const mappedTiers = document.tiers.map((tier) => ({
      tierName: tier.tierName,
      countires: [...tier.countires],
    }));

    setConfigId(document._id ?? null);
    setTiers(mappedTiers);
    setMatrix(mapApiMatrixToUiMap(document.matrix));
  }, []);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        setHasLoaded(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedData = tiersRef.current.length > 0 || Boolean(configIdRef.current);

      if (mode === 'initial' && !hasCachedData) {
        setIsLoading(true);
        setHasLoaded(false);
      } else {
        setIsRefreshing(true);
      }

      try {
        const document = await getAdminShippingConfig();
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!isDirty) {
          applyLoadedConfig(document);
        }

        setError(null);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!tiersRef.current.length && !configIdRef.current) {
          setError(getErrorMessage(loadError, 'Failed to load shipping configuration'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setHasLoaded(true);
        }
      }
    },
    [applyLoadedConfig, enabled, isDirty],
  );

  useEffect(() => {
    if (enabled) {
      setIsLoading(true);
      setHasLoaded(false);
    }
    void load('initial');
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when enabled toggles

  useFocusEffect(
    useCallback(() => {
      if (!enabled || isDirty || isSaving) {
        return;
      }

      void load('refresh');
    }, [enabled, isDirty, isSaving, load]),
  );

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const upsertTier = useCallback(
    (draft: AdminShippingTierDraft, editingIndex: number | null) => {
      setTiers((previousTiers) => {
        const nextTiers =
          editingIndex != null
            ? previousTiers.map((tier, index) => (index === editingIndex ? draft : tier))
            : [...previousTiers, draft];

        setMatrix((previousMatrix) =>
          migrateMatrixForTierChange(previousTiers, nextTiers, previousMatrix, editingIndex),
        );
        return nextTiers;
      });
      setIsDirty(true);
      setSaveError(null);
    },
    [],
  );

  const deleteTier = useCallback(async (index: number) => {
    const previousTiers = tiersRef.current;
    const nextTiers = previousTiers.filter((_, tierIndex) => tierIndex !== index);
    const nextMatrix = rebuildMatrixForTiers(nextTiers, matrixRef.current);

    setTiers(nextTiers);
    setMatrix(nextMatrix);
    setIsDirty(nextTiers.length > 0);
    setSaveError(null);

    if (nextTiers.length === 0 && configIdRef.current) {
      try {
        await deleteAdminShippingConfig(configIdRef.current);
        setConfigId(null);
        setIsDirty(false);
      } catch (deleteError) {
        setSaveError(getErrorMessage(deleteError, 'Failed to delete shipping configuration'));
      }
    }
  }, []);

  const updateMatrixCell = useCallback((fromTier: string, toTier: string, value: string) => {
    setMatrix((previous) => ({
      ...previous,
      [fromTier]: {
        ...previous[fromTier],
        [toTier]: value,
      },
    }));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  const saveAll = useCallback(async () => {
    if (!tiers.length) {
      setSaveError('Add at least one tier before saving.');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = buildShippingConfigSavePayload({
        configId: configIdRef.current,
        tiers,
        matrix,
      });

      const saved = await saveAdminShippingConfig(payload);
      setConfigId(saved._id ?? configIdRef.current);
      applyLoadedConfig(saved);
      setIsDirty(false);
      return true;
    } catch (saveFailure) {
      setSaveError(getErrorMessage(saveFailure, 'Failed to save shipping configuration'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applyLoadedConfig, matrix, tiers]);

  return {
    configId,
    tiers,
    matrix,
    isLoading,
    hasLoaded,
    isRefreshing,
    isSaving,
    isDirty,
    error,
    saveError,
    canSave: tiers.length > 0 && isDirty && !isSaving,
    upsertTier,
    deleteTier,
    updateMatrixCell,
    saveAll,
    refresh,
    clearSaveError: () => setSaveError(null),
  };
}
