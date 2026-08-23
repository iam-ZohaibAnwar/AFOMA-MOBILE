import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { updateAdminSellerBasicInfo } from '../api/adminSellerManagementApi';
import type {
  AdminSellerBasicInfoFormValues,
  AdminSellerListItem,
} from '../types/adminSellerManagement';
import { setAdminSellerSessionPatch } from '../state/adminSellerSessionPatch';
import {
  adminBasicInfoFormFromSeller,
  buildAdminSellerBasicInfoPayload,
  validateAdminSellerBasicInfoForm,
} from '../utils/adminSellerBasicInfo';

export function useAdminSellerBasicInfoSave(sellerId?: string, seller?: AdminSellerListItem | null) {
  const [values, setValues] = useState<AdminSellerBasicInfoFormValues>(() =>
    adminBasicInfoFormFromSeller(seller),
  );
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AdminSellerBasicInfoFormValues, string>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const seededSellerIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!sellerId || seededSellerIdRef.current === sellerId) {
      return;
    }

    seededSellerIdRef.current = sellerId;
    setValues(adminBasicInfoFormFromSeller(seller));
    setFieldErrors({});
    setSaveError(null);
    setSaveSuccess(false);
  }, [seller, sellerId]);

  const updateField = useCallback(
    <K extends keyof AdminSellerBasicInfoFormValues>(key: K, value: AdminSellerBasicInfoFormValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => {
        if (!current[key]) {
          return current;
        }
        const next = { ...current };
        delete next[key];
        return next;
      });
      setSaveSuccess(false);
    },
    [],
  );

  const isDirty = useMemo(() => {
    const baseline = adminBasicInfoFormFromSeller(seller);
    return (Object.keys(baseline) as Array<keyof AdminSellerBasicInfoFormValues>).some(
      (key) => values[key] !== baseline[key],
    );
  }, [seller, values]);

  const saveBasicInfo = useCallback(async (): Promise<AdminSellerListItem | null> => {
    if (!sellerId) {
      return null;
    }

    const errors = validateAdminSellerBasicInfoForm(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return null;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updatedSeller = await updateAdminSellerBasicInfo(
        sellerId,
        buildAdminSellerBasicInfoPayload(values),
      );

      setAdminSellerSessionPatch(sellerId, updatedSeller);
      setValues(adminBasicInfoFormFromSeller(updatedSeller));
      setSaveSuccess(true);
      return updatedSeller;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to update basic information'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [sellerId, values]);

  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  return {
    values,
    fieldErrors,
    isDirty,
    isSaving,
    saveError,
    saveSuccess,
    updateField,
    saveBasicInfo,
    clearSaveError,
  };
}
