import { useCallback, useMemo, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { saveSellerShippingConfig } from '../shipping/api/sellerShippingApi';
import { getSellerProfile, updateSellerProfile } from '../../../services/api/sellersApi';
import {
  buildCurrencyOnlySavePayload,
  fetchCurrencyToCadRate,
} from '../shipping/utils/sellerShippingMappers';
import type { SellerProfile, SellerSetupSectionId } from '../types/sellerProfile';
import {
  buildBasicInfoPayload,
  buildPaymentInfoPayload,
  buildSellerAddressPayload,
  buildSellerDetailsPayload,
  buildSellerPoliciesPayload,
  basicInfoFormFromProfile,
  currencyFormFromProfile,
  paymentInfoFormFromProfile,
  sellerAddressFormFromProfile,
  sellerDetailsFormFromProfile,
  sellerPoliciesFormFromProfile,
  type BasicInfoFormValues,
  type CurrencyFormValues,
  type PaymentInfoFormValues,
  type SellerAddressFormValues,
  type SellerDetailsFormValues,
  type SellerPoliciesFormValues,
} from '../utils/sellerSetupForms';

export function useSellerSetupSectionSave(
  sellerId: string | undefined,
  sectionId: SellerSetupSectionId,
  profile: SellerProfile | null,
  onSaved: (nextProfile: SellerProfile) => void,
) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const initialValues = useMemo(() => {
    switch (sectionId) {
      case 'basicInfo':
        return basicInfoFormFromProfile(profile);
      case 'address':
        return sellerAddressFormFromProfile(profile);
      case 'sellerDetails':
        return sellerDetailsFormFromProfile(profile);
      case 'paymentInfo':
        return paymentInfoFormFromProfile(profile);
      case 'sellerPolicies':
        return sellerPoliciesFormFromProfile(profile);
      case 'currency':
        return currencyFormFromProfile(profile);
      default:
        return {};
    }
  }, [profile, sectionId]);

  const refreshProfile = useCallback(async () => {
    if (!sellerId) {
      return null;
    }

    const refreshed = await getSellerProfile(sellerId);
    onSaved(refreshed);
    return refreshed;
  }, [onSaved, sellerId]);

  const saveSection = useCallback(
    async (
      values:
        | BasicInfoFormValues
        | SellerAddressFormValues
        | SellerDetailsFormValues
        | PaymentInfoFormValues
        | SellerPoliciesFormValues
        | CurrencyFormValues,
    ) => {
      if (!sellerId) {
        setSaveError('Seller ID unavailable.');
        return false;
      }

      if (sectionId === 'domesticShipping' || sectionId === 'internationalShipping') {
        setSaveError('Configure domestic and international shipping in the Shipping screen.');
        return false;
      }

      setIsSaving(true);
      setSaveError(null);
      setSaveSuccessMessage(null);

      try {
        if (sectionId === 'currency') {
          const currencyValues = values as CurrencyFormValues;
          const conversionRateCad = await fetchCurrencyToCadRate(currencyValues.currency);

          await saveSellerShippingConfig(
            buildCurrencyOnlySavePayload({
              currency: currencyValues.currency,
              sellerId,
              existingConfig: profile?.shippingConfigId,
              conversionRateCad,
            }),
          );
          await refreshProfile();
        } else {
          let payload: Record<string, unknown>;

          switch (sectionId) {
            case 'basicInfo':
              payload = buildBasicInfoPayload(values as BasicInfoFormValues);
              break;
            case 'address':
              payload = buildSellerAddressPayload(values as SellerAddressFormValues);
              break;
            case 'sellerDetails':
              payload = buildSellerDetailsPayload(values as SellerDetailsFormValues, profile);
              break;
            case 'paymentInfo':
              payload = buildPaymentInfoPayload(values as PaymentInfoFormValues, profile);
              break;
            case 'sellerPolicies':
              payload = buildSellerPoliciesPayload(values as SellerPoliciesFormValues);
              break;
            default:
              setSaveError('Unsupported setup section.');
              return false;
          }

          const response = await updateSellerProfile(sellerId, payload);
          onSaved(response);
        }

        setSaveSuccessMessage('Saved successfully.');
        return true;
      } catch (err) {
        setSaveError(getErrorMessage(err, 'Failed to save section'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [onSaved, profile, refreshProfile, sectionId, sellerId],
  );

  return {
    initialValues,
    isSaving,
    saveError,
    saveSuccessMessage,
    saveSection,
    setSaveError,
    setSaveSuccessMessage,
  };
}
