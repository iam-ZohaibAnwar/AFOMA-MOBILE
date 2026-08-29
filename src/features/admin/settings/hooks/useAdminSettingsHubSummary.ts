import { useCallback, useEffect, useRef, useState } from 'react';

import { getAdminShippingConfig } from '../api/adminShippingConfigApi';
import { getAdminSettingDocumentByType } from '../api/adminSettingsApi';
import type { AdminCommissionRateSettingType } from '../types/adminSettings';
import {
  ADMIN_COMMISSION_RATE_SETTING_TYPES,
  parseAdminCommissionRateContent,
  parseAdminFeaturedShopsContent,
} from '../utils/adminSettingsContent';
import {
  formatAdminCommissionRateMeta,
  formatAdminFeaturedShopsMeta,
  formatAdminShippingTiersMeta,
} from '../utils/adminSettingsDisplay';
import type { AdminSettingsHubCardMeta } from '../components/AdminSettingsHubCard';

export interface AdminSettingsHubSummary {
  commissionRatesMeta: AdminSettingsHubCardMeta;
  featuredShopsMeta: AdminSettingsHubCardMeta;
  shippingMatrixMeta: AdminSettingsHubCardMeta;
  commissionRateCards: Record<AdminCommissionRateSettingType, AdminSettingsHubCardMeta | null>;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

interface UseAdminSettingsHubSummaryOptions {
  enabled: boolean;
}

export function useAdminSettingsHubSummary({
  enabled,
}: UseAdminSettingsHubSummaryOptions): AdminSettingsHubSummary {
  const [commissionRates, setCommissionRates] = useState<
    Record<AdminCommissionRateSettingType, number | null>
  >({
    'affiliate-commission': null,
    'seller-referral-commission': null,
    'buyer-referral-commission': null,
  });
  const [featuredShopCount, setFeaturedShopCount] = useState<number | null>(null);
  const [shippingTierCount, setShippingTierCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestVersionRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;

      if (mode === 'initial' && !hasLoadedRef.current) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [affiliateDoc, sellerReferralDoc, buyerReferralDoc, shopsDoc, shippingConfig] =
          await Promise.all([
            getAdminSettingDocumentByType('affiliate-commission'),
            getAdminSettingDocumentByType('seller-referral-commission'),
            getAdminSettingDocumentByType('buyer-referral-commission'),
            getAdminSettingDocumentByType('shops'),
            getAdminShippingConfig(),
          ]);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setCommissionRates({
          'affiliate-commission': parseAdminCommissionRateContent(affiliateDoc?.content),
          'seller-referral-commission': parseAdminCommissionRateContent(sellerReferralDoc?.content),
          'buyer-referral-commission': parseAdminCommissionRateContent(buyerReferralDoc?.content),
        });
        setFeaturedShopCount(parseAdminFeaturedShopsContent(shopsDoc?.content).length);
        setShippingTierCount(shippingConfig?.tiers?.length ?? 0);
        hasLoadedRef.current = true;
      } catch {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    void load('initial');
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps -- reload when enabled changes

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const configuredRates = ADMIN_COMMISSION_RATE_SETTING_TYPES.filter(
    (type) => commissionRates[type] != null,
  ).length;

  return {
    commissionRatesMeta: formatAdminCommissionRatesSummaryMeta(configuredRates),
    featuredShopsMeta: formatAdminFeaturedShopsMeta(featuredShopCount),
    shippingMatrixMeta: formatAdminShippingTiersMeta(shippingTierCount),
    commissionRateCards: {
      'affiliate-commission': formatAdminCommissionRateMeta(commissionRates['affiliate-commission']),
      'seller-referral-commission': formatAdminCommissionRateMeta(
        commissionRates['seller-referral-commission'],
      ),
      'buyer-referral-commission': formatAdminCommissionRateMeta(
        commissionRates['buyer-referral-commission'],
      ),
    },
    isLoading,
    isRefreshing,
    refresh,
  };
}

function formatAdminCommissionRatesSummaryMeta(
  configuredCount: number,
): AdminSettingsHubCardMeta {
  if (configuredCount === 0) {
    return {
      label: 'Not configured',
      icon: 'alert-circle-outline',
      tone: 'neutral',
    };
  }

  return {
    label: `${configuredCount} of 3 rates set`,
    icon: 'pie-chart-outline',
    tone: configuredCount === 3 ? 'success' : 'warning',
  };
}
