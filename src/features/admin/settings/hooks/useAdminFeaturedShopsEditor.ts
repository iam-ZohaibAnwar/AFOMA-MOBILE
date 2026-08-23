import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminFeaturedShopSeller } from '../types/adminSettings';
import {
  getAdminFeaturedShopSellerId,
  validateAdminFeaturedShopsSelection,
} from '../utils/adminSettingsContent';
import { useAdminFeaturedShopsSetting } from './useAdminSettingByType';

interface UseAdminFeaturedShopsEditorOptions {
  enabled: boolean;
  createdBy: string | undefined;
}

export function useAdminFeaturedShopsEditor({ enabled, createdBy }: UseAdminFeaturedShopsEditorOptions) {
  const setting = useAdminFeaturedShopsSetting({ enabled });
  const [draftShops, setDraftShops] = useState<AdminFeaturedShopSeller[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (setting.isLoading || isSaving || isDirty) {
      return;
    }

    setDraftShops((current) => {
      if (
        current.length === setting.shops.length &&
        current.every((shop, index) => shop === setting.shops[index])
      ) {
        return current;
      }

      return setting.shops;
    });
  }, [isDirty, isSaving, setting.isLoading, setting.shops]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || isDirty || isSaving) {
        return;
      }

      void setting.refresh();
    }, [enabled, isDirty, isSaving, setting.refresh]),
  );

  const selectedSellerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const shop of draftShops) {
      const id = getAdminFeaturedShopSellerId(shop);
      if (id) {
        ids.add(id);
      }
    }
    return ids;
  }, [draftShops]);

  const addShop = useCallback(
    (shop: AdminFeaturedShopSeller): { ok: true } | { ok: false; error: string } => {
      const shopId = getAdminFeaturedShopSellerId(shop);
      if (!shopId) {
        return { ok: false, error: 'Seller is missing an id.' };
      }

      if (draftShops.some((entry) => getAdminFeaturedShopSellerId(entry) === shopId)) {
        return { ok: true };
      }

      const next = [...draftShops, shop];
      const validationError = validateAdminFeaturedShopsSelection(next);
      if (validationError) {
        return { ok: false, error: validationError };
      }

      setDraftShops(next);
      setIsDirty(true);
      setSaveError(null);
      return { ok: true };
    },
    [draftShops],
  );

  const removeShop = useCallback((shopId: string) => {
    setDraftShops((current) => current.filter((entry) => getAdminFeaturedShopSellerId(entry) !== shopId));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  const moveShop = useCallback((shopId: string, direction: 'up' | 'down') => {
    setDraftShops((current) => {
      const index = current.findIndex((entry) => getAdminFeaturedShopSellerId(entry) === shopId);
      if (index < 0) {
        return current;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setIsDirty(true);
    setSaveError(null);
  }, []);

  const save = useCallback(async () => {
    if (!createdBy) {
      setSaveError('Admin session is missing a user id.');
      return false;
    }

    const validationError = validateAdminFeaturedShopsSelection(draftShops);
    if (validationError) {
      setSaveError(validationError);
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await setting.saveShops(draftShops, createdBy);
      await setting.refresh();
      setIsDirty(false);
      return true;
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Failed to save featured shops'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [createdBy, draftShops, setting]);

  const canSave = Boolean(createdBy) && isDirty && !isSaving;

  return {
    ...setting,
    draftShops,
    selectedSellerIds,
    isDirty,
    isSaving,
    saveError,
    canSave,
    addShop,
    removeShop,
    moveShop,
    save,
    clearSaveError: () => setSaveError(null),
  };
}
