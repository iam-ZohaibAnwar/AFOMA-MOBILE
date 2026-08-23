import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCouponById,
  updateAdminCoupon,
} from '../api/adminCouponsApi';
import type { AdminCouponFormValues, AdminCouponListItem } from '../types/adminCoupons';
import { mergeAdminCouponDetail } from '../utils/adminCouponsContent';
import {
  buildAdminCouponCreatePayload,
  buildAdminCouponEditPayload,
  createEmptyAdminCouponFormValues,
  hasAdminCouponFormErrors,
  mapAdminCouponToFormValues,
  type AdminCouponFormErrors,
  validateAdminCouponForm,
} from '../utils/adminCouponValidation';

interface UseAdminCouponFormOptions {
  adminUserId?: string;
  couponId?: string;
  initialCoupon?: AdminCouponListItem;
  enabled: boolean;
}

export function useAdminCouponForm({
  adminUserId,
  couponId,
  initialCoupon,
  enabled,
}: UseAdminCouponFormOptions) {
  const isEditMode = Boolean(couponId);
  const [values, setValues] = useState<AdminCouponFormValues>(() =>
    initialCoupon ? mapAdminCouponToFormValues(initialCoupon) : createEmptyAdminCouponFormValues(),
  );
  const [errors, setErrors] = useState<AdminCouponFormErrors>({});
  const [existingCoupon, setExistingCoupon] = useState<AdminCouponListItem | null>(initialCoupon ?? null);
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
      setValues(createEmptyAdminCouponFormValues());
      setErrors({});
      setExistingCoupon(null);
      setLoadError(null);
      setSaveError(null);
      setDeleteError(null);
      setIsLoading(false);
      return;
    }

    if (initialCoupon) {
      setValues(mapAdminCouponToFormValues(initialCoupon));
      setExistingCoupon(initialCoupon);
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

    void getAdminCouponById(couponId)
      .then((remoteCoupon) => {
        if (cancelled) {
          return;
        }

        const merged = mergeAdminCouponDetail(initialCoupon, remoteCoupon);
        if (merged) {
          setExistingCoupon(merged);
          if (!initialCoupon) {
            setValues(mapAdminCouponToFormValues(merged));
          }
        }
      })
      .catch((err) => {
        if (!cancelled && !initialCoupon) {
          setLoadError(getErrorMessage(err, 'Failed to load coupon'));
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
    <K extends keyof AdminCouponFormValues>(field: K, value: AdminCouponFormValues[K]) => {
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

    if (!adminUserId) {
      setSaveError('You must be signed in as admin to save a coupon.');
      return null;
    }

    const validationErrors = validateAdminCouponForm(values);
    setErrors(validationErrors);

    if (hasAdminCouponFormErrors(validationErrors)) {
      return null;
    }

    submitLockRef.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (isEditMode && couponId) {
        if (!existingCoupon) {
          setSaveError('Coupon data is still loading. Try again in a moment.');
          return null;
        }

        const { payload, errors: buildErrors } = buildAdminCouponEditPayload(values, existingCoupon);
        if (!payload || hasAdminCouponFormErrors(buildErrors)) {
          setErrors(buildErrors);
          return null;
        }

        await updateAdminCoupon(couponId, payload);
        return 'Coupon updated successfully!';
      }

      const { payload, errors: buildErrors } = buildAdminCouponCreatePayload(values, adminUserId);
      if (!payload || hasAdminCouponFormErrors(buildErrors)) {
        setErrors(buildErrors);
        return null;
      }

      await createAdminCoupon(payload);
      return 'Coupon created successfully!';
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to save coupon'));
      return null;
    } finally {
      submitLockRef.current = false;
      setIsSaving(false);
    }
  }, [adminUserId, couponId, existingCoupon, isDeleting, isEditMode, isSaving, values]);

  const deleteCoupon = useCallback(async (): Promise<string | null> => {
    if (!couponId || deleteLockRef.current || isDeleting || isSaving) {
      return null;
    }

    deleteLockRef.current = true;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAdminCoupon(couponId);
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
  };
}
