import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createSellerCoupon,
  deleteSellerCoupon,
  getSellerCoupon,
  updateSellerCoupon,
} from '../api/sellerCouponsApi';
import type { SellerCoupon, SellerCouponFormErrors, SellerCouponFormValues } from '../types/sellerCoupon';
import {
  buildSellerCouponPayload,
  createEmptySellerCouponFormValues,
  hasSellerCouponFormErrors,
  mapSellerCouponToFormValues,
  validateSellerCouponForm,
} from '../utils/sellerCouponValidation';

interface UseSellerCouponFormOptions {
  userId?: string;
  couponId?: string;
  initialCoupon?: SellerCoupon;
  enabled: boolean;
}

export function useSellerCouponForm({
  userId,
  couponId,
  initialCoupon,
  enabled,
}: UseSellerCouponFormOptions) {
  const isEditMode = Boolean(couponId);
  const [values, setValues] = useState<SellerCouponFormValues>(() =>
    initialCoupon ? mapSellerCouponToFormValues(initialCoupon) : createEmptySellerCouponFormValues(),
  );
  const [errors, setErrors] = useState<SellerCouponFormErrors>({});
  const [isLoading, setIsLoading] = useState(Boolean(isEditMode && couponId && !initialCoupon));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const submitLockRef = useRef(false);
  const deleteLockRef = useRef(false);

  useEffect(() => {
    if (!couponId) {
      setValues(createEmptySellerCouponFormValues());
      setErrors({});
      setLoadError(null);
      setSaveError(null);
      setDeleteError(null);
      setIsLoading(false);
      return;
    }

    if (initialCoupon) {
      setValues(mapSellerCouponToFormValues(initialCoupon));
      setErrors({});
    }

    if (!enabled) {
      return;
    }

    let cancelled = false;
    if (!initialCoupon) {
      setIsLoading(true);
    }
    setLoadError(null);

    void getSellerCoupon(couponId)
      .then((coupon) => {
        if (!cancelled) {
          setValues(mapSellerCouponToFormValues(coupon));
          setErrors({});
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (!initialCoupon) {
            setLoadError(getErrorMessage(err, 'Failed to load coupon'));
          }
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [couponId, enabled, initialCoupon]);

  const updateField = useCallback(
    <K extends keyof SellerCouponFormValues>(field: K, value: SellerCouponFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const next = { ...current };
        delete next[field];
        return next;
      });
      setSaveError(null);
      setDeleteError(null);
    },
    [],
  );

  const submit = useCallback(async (): Promise<string | null> => {
    if (submitLockRef.current || isSaving || isDeleting) {
      return null;
    }

    if (!userId) {
      setSaveError('You must be signed in to save a coupon.');
      return null;
    }

    const validationErrors = validateSellerCouponForm(values);
    setErrors(validationErrors);

    if (hasSellerCouponFormErrors(validationErrors)) {
      return null;
    }

    const { payload, errors: buildErrors } = buildSellerCouponPayload(values, userId);
    if (!payload || hasSellerCouponFormErrors(buildErrors)) {
      setErrors(buildErrors);
      return null;
    }

    submitLockRef.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (isEditMode && couponId) {
        await updateSellerCoupon(couponId, payload);
        return 'Coupon updated successfully!';
      }

      await createSellerCoupon(payload);
      return 'Coupon created successfully!';
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save coupon'));
      return null;
    } finally {
      submitLockRef.current = false;
      setIsSaving(false);
    }
  }, [couponId, isDeleting, isEditMode, isSaving, userId, values]);

  const deleteCoupon = useCallback(async (): Promise<string | null> => {
    if (!couponId || deleteLockRef.current || isDeleting || isSaving) {
      return null;
    }

    deleteLockRef.current = true;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteSellerCoupon(couponId);
      return 'Coupon deleted successfully!';
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete coupon'));
      return null;
    } finally {
      deleteLockRef.current = false;
      setIsDeleting(false);
    }
  }, [couponId, isDeleting, isSaving]);

  const isBusy = isSaving || isDeleting;

  return {
    values,
    errors,
    isEditMode,
    isLoading,
    isSaving,
    isDeleting,
    isBusy,
    loadError,
    saveError,
    deleteError,
    updateField,
    submit,
    deleteCoupon,
    setSaveError,
    setDeleteError,
  };
}

/** @deprecated Pass options object to useSellerCouponForm instead. */
export function useSellerCouponFormLegacy(userId?: string, couponId?: string) {
  return useSellerCouponForm({ userId, couponId, enabled: Boolean(userId) });
}
