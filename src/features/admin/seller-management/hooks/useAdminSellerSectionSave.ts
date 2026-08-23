import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { updateAdminSellerProfile } from '../api/adminSellerManagementApi';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../types/adminSellerManagement';
import type { AdminSellerSectionFormValues } from '../types/adminSellerSections';
import { setAdminSellerSessionPatch } from '../state/adminSellerSessionPatch';
import {
  adminSectionFormFromSeller,
  buildAdminSellerSectionPayload,
  validateAdminSellerSectionForm,
} from '../utils/adminSellerSectionForms';

export function useAdminSellerSectionSave(
  sectionId: AdminEditableSellerSectionId,
  sellerId?: string,
  seller?: AdminSellerListItem | null,
) {
  const [values, setValues] = useState<AdminSellerSectionFormValues>(() =>
    adminSectionFormFromSeller(sectionId, seller),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const seededKeyRef = useRef<string | undefined>(undefined);

  const seedKey = sellerId ? `${sellerId}:${sectionId}` : undefined;

  useEffect(() => {
    if (!seedKey || seededKeyRef.current === seedKey) {
      return;
    }

    seededKeyRef.current = seedKey;
    setValues(adminSectionFormFromSeller(sectionId, seller));
    setFieldErrors({});
    setSaveError(null);
  }, [sectionId, seedKey, seller]);

  const baselineValues = useMemo(
    () => adminSectionFormFromSeller(sectionId, seller),
    [sectionId, seller],
  );

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baselineValues),
    [baselineValues, values],
  );

  const updateValues = useCallback((patch: Partial<AdminSellerSectionFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setSaveError(null);
  }, []);

  const updateField = useCallback((key: string, value: unknown) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveError(null);
  }, []);

  const saveSection = useCallback(async (): Promise<AdminSellerListItem | null> => {
    if (!sellerId) {
      return null;
    }

    const errors = validateAdminSellerSectionForm(sectionId, values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedSeller = await updateAdminSellerProfile(
        sellerId,
        buildAdminSellerSectionPayload(sectionId, values, seller),
      );

      setAdminSellerSessionPatch(sellerId, updatedSeller);
      setValues(adminSectionFormFromSeller(sectionId, updatedSeller));
      return updatedSeller;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save section'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [sectionId, seller, sellerId, values]);

  const clearSaveError = useCallback(() => {
    setSaveError(null);
  }, []);

  return {
    values,
    fieldErrors,
    isDirty,
    isSaving,
    saveError,
    updateValues,
    updateField,
    saveSection,
    clearSaveError,
  };
}
