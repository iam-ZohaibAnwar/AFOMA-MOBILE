import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getAdminSettingByType, postAdminSetting, putAdminSetting } from '../api/adminSettingsApi';
import type {
  AdminCommissionRateSettingType,
  AdminCommissionRateValue,
  AdminFeaturedShopSeller,
  AdminSettingDocument,
  AdminSettingUpsertBody,
  AdminSettingsV1SettingType,
} from '../types/adminSettings';
import {
  parseAdminCommissionRateContent,
  parseAdminFeaturedShopsContent,
  stringifyAdminCommissionRateContent,
  stringifyAdminFeaturedShopsContent,
} from '../utils/adminSettingsContent';

interface UseAdminSettingByTypeOptions {
  enabled: boolean;
}

interface UseAdminSettingByTypeResult {
  document: AdminSettingDocument | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveContent: (contentString: string, createdBy: string) => Promise<AdminSettingDocument>;
}

export function useAdminSettingByType(
  type: AdminSettingsV1SettingType,
  { enabled }: UseAdminSettingByTypeOptions,
): UseAdminSettingByTypeResult {
  const [document, setDocument] = useState<AdminSettingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const documentRef = useRef<AdminSettingDocument | null>(null);

  documentRef.current = document;

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedDocument = Boolean(documentRef.current);

      if (mode === 'initial' && !hasCachedDocument) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const response = await getAdminSettingByType(type);
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setDocument(response.settings?.[0] ?? null);
        setError(null);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!documentRef.current) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load setting');
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled, type],
  );

  useEffect(() => {
    void load('initial');
  }, [enabled, type]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when type/enabled changes

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const saveContent = useCallback(
    async (contentString: string, createdBy: string): Promise<AdminSettingDocument> => {
      const body: AdminSettingUpsertBody = {
        type,
        content: contentString,
        createdBy,
      };

      const currentId = documentRef.current?._id;
      const saved = currentId
        ? await putAdminSetting(currentId, body)
        : await postAdminSetting(body);

      setDocument(saved);
      setError(null);
      return saved;
    },
    [type],
  );

  return {
    document,
    isLoading,
    isRefreshing,
    error,
    refresh,
    saveContent,
  };
}

export function useAdminCommissionRateSetting(
  rateType: AdminCommissionRateSettingType,
  options: UseAdminSettingByTypeOptions,
) {
  const base = useAdminSettingByType(rateType, options);
  const value = parseAdminCommissionRateContent(base.document?.content);

  const saveRate = useCallback(
    async (nextValue: AdminCommissionRateValue, createdBy: string) => {
      return base.saveContent(stringifyAdminCommissionRateContent(nextValue), createdBy);
    },
    [base.saveContent],
  );

  return {
    ...base,
    rateType,
    value,
    saveRate,
  };
}

export function useAdminFeaturedShopsSetting(options: UseAdminSettingByTypeOptions) {
  const base = useAdminSettingByType('shops', options);
  const shops = useMemo(
    () => parseAdminFeaturedShopsContent(base.document?.content),
    [base.document?.content],
  );

  const saveShops = useCallback(
    async (nextShops: AdminFeaturedShopSeller[], createdBy: string) => {
      return base.saveContent(stringifyAdminFeaturedShopsContent(nextShops), createdBy);
    },
    [base.saveContent],
  );

  return {
    ...base,
    shops,
    saveShops,
  };
}
