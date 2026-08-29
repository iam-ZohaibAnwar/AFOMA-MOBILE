import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { getSellerProfile } from '../../../../services/api/sellersApi';
import type { SellerProfile } from '../../types/sellerProfile';
import { getSellerShippingConfig, saveSellerShippingConfig } from '../api/sellerShippingApi';
import type { SellerShippingConfig, SellerShippingFormState } from '../types/sellerShipping';
import {
  buildShippingSavePayload,
  emptySellerShippingFormState,
  fetchCurrencyToCadRate,
  shippingConfigToFormState,
  validateShippingForm,
} from '../utils/sellerShippingMappers';

interface UseSellerShippingConfigOptions {
  includeProfileSetup?: boolean;
}

export function useSellerShippingConfig(
  sellerId?: string,
  { includeProfileSetup = true }: UseSellerShippingConfigOptions = {},
) {
  const [config, setConfig] = useState<SellerShippingConfig | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [form, setForm] = useState<SellerShippingFormState>(emptySellerShippingFormState());
  const [conversionRateCad, setConversionRateCad] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const applyCurrencyRate = useCallback(async (currency: string, existingRate?: number | string) => {
    if (existingRate != null && Number(existingRate) > 0 && currency.trim().toLowerCase() === 'cad') {
      setConversionRateCad(Number(existingRate) || 1);
      return Number(existingRate) || 1;
    }

    try {
      const rate = await fetchCurrencyToCadRate(currency);
      setConversionRateCad(rate);
      return rate;
    } catch {
      setConversionRateCad(Number(existingRate) || 1);
      return Number(existingRate) || 1;
    }
  }, []);

  const load = useCallback(async () => {
    if (!sellerId) {
      setConfig(null);
      setProfile(null);
      setForm(emptySellerShippingFormState());
      setError(null);
      setIsLoading(false);
      setHasLoaded(false);
      return;
    }

    setIsLoading(true);
    setHasLoaded(false);
    setError(null);

    try {
      const [shippingConfig, sellerProfile] = await Promise.all([
        getSellerShippingConfig(sellerId),
        getSellerProfile(sellerId),
      ]);

      setConfig(shippingConfig);
      setProfile(sellerProfile);
      setForm(shippingConfigToFormState(shippingConfig));
      await applyCurrencyRate(
        shippingConfig.currency ?? 'cad',
        shippingConfig.conversion_rate,
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load shipping configuration'));
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [applyCurrencyRate, sellerId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateForm = useCallback((updater: (current: SellerShippingFormState) => SellerShippingFormState) => {
    setForm((current) => updater(current));
    setSaveSuccessMessage(null);
    setSaveError(null);
  }, []);

  const changeCurrency = useCallback(
    async (currency: string) => {
      updateForm((current) => ({ ...current, currency }));
      await applyCurrencyRate(currency);
    },
    [applyCurrencyRate, updateForm],
  );

  const save = useCallback(async () => {
    if (!sellerId) {
      setSaveError('Seller ID unavailable.');
      return false;
    }

    const currentForm = formRef.current;
    const validation = validateShippingForm(currentForm, profile?.countryCode);
    if (!validation.valid) {
      setSaveError(validation.message ?? 'Fix the shipping configuration before saving.');
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMessage(null);

    try {
      const rate = await applyCurrencyRate(currentForm.currency, conversionRateCad);
      const payload = buildShippingSavePayload({
        form: currentForm,
        sellerId,
        existingConfig: config,
        conversionRateCad: rate,
        includeProfileSetup,
      });

      const saved = await saveSellerShippingConfig(payload);
      const refreshedProfile = await getSellerProfile(sellerId);

      setConfig(saved);
      setProfile(refreshedProfile);
      setForm(shippingConfigToFormState(saved));
      await applyCurrencyRate(saved.currency ?? currentForm.currency, saved.conversion_rate);
      setSaveSuccessMessage('Shipping configuration saved.');
      return true;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save shipping configuration'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applyCurrencyRate, config, conversionRateCad, includeProfileSetup, profile?.countryCode, sellerId]);

  return {
    config,
    profile,
    form,
    conversionRateCad,
    isLoading,
    hasLoaded,
    isSaving,
    error,
    saveError,
    saveSuccessMessage,
    updateForm,
    changeCurrency,
    save,
    reload: load,
    setSaveError,
    setSaveSuccessMessage,
  };
}
