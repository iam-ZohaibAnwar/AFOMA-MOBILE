import { useCallback, useState } from 'react';

import { ApiError, getErrorMessage } from '../../../../services/api/errors';
import { createAdminSeller } from '../api/adminSellerManagementApi';
import {
  ADMIN_CREATE_SELLER_INITIAL_VALUES,
  type AdminCreateSellerFormValues,
} from '../types/adminCreateSeller';
import {
  buildAdminCreateSellerPayload,
  mapAdminCreateSellerDuplicateError,
  validateAdminCreateSellerForm,
} from '../utils/adminCreateSeller';

export function useAdminCreateSeller() {
  const [values, setValues] = useState<AdminCreateSellerFormValues>(ADMIN_CREATE_SELLER_INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AdminCreateSellerFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof AdminCreateSellerFormValues>(key: K, value: AdminCreateSellerFormValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => {
        if (!current[key]) {
          return current;
        }
        const next = { ...current };
        delete next[key];
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  const updateAddressRegion = useCallback(
    (selection: Pick<AdminCreateSellerFormValues, 'country' | 'countryCode' | 'state' | 'stateCode'>) => {
      setValues((current) => ({
        ...current,
        country: selection.country,
        countryCode: selection.countryCode,
        state: selection.state,
        stateCode: selection.stateCode,
      }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.country;
        delete next.state;
        return next;
      });
      setSubmitError(null);
    },
    [],
  );

  const submitCreateSeller = useCallback(async (): Promise<boolean> => {
    const errors = validateAdminCreateSellerForm(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createAdminSeller(buildAdminCreateSellerPayload(values));
      return true;
    } catch (err) {
      const statusCode = err instanceof ApiError ? err.statusCode : undefined;
      const duplicateMessage = mapAdminCreateSellerDuplicateError(statusCode, getErrorMessage(err));
      setSubmitError(duplicateMessage ?? getErrorMessage(err, 'Failed to create seller'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    updateField,
    updateAddressRegion,
    submitCreateSeller,
    clearSubmitError,
  };
}
