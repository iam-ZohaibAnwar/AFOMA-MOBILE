import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getUserProfile, updateUserProfile } from '../../../services/api/usersApi';
import { updateStoredProfile } from '../../../services/auth/authSession';
import type { AuthUser } from '../../auth/types';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  accountDetailsFormFromCachedUser,
  accountDetailsFormFromProfile,
  buildUpdateUserProfileRequest,
  emptyAccountDetailsFormValues,
  hasAccountDetailsFormErrors,
  validateAccountDetailsForm,
  type AccountDetailsFormErrors,
  type AccountDetailsFormField,
  type AccountDetailsFormValues,
  mapUserProfileToStoredProfile,
} from '../utils/accountDetailsForm';
import type { CountryStateSelection } from '../../../utils/regionOptions';

export function useAccountDetails(authUserId?: string, cachedUser?: AuthUser | null) {
  const { refreshSession } = useAuth();
  const [values, setValues] = useState<AccountDetailsFormValues>(() =>
    cachedUser ? accountDetailsFormFromCachedUser(cachedUser) : emptyAccountDetailsFormValues(),
  );
  const [fieldErrors, setFieldErrors] = useState<AccountDetailsFormErrors>({});
  const [isLoading, setIsLoading] = useState(Boolean(authUserId));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!authUserId) {
      setLoadError('User ID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setSaveSuccessMessage(null);

    try {
      const profile = await getUserProfile(authUserId);
      setValues(accountDetailsFormFromProfile(profile, cachedUser));
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Failed to load account details'));
      if (cachedUser) {
        setValues(accountDetailsFormFromCachedUser(cachedUser));
      }
    } finally {
      setIsLoading(false);
    }
  }, [authUserId, cachedUser]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = useCallback((field: AccountDetailsFormField, nextValue: string) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaveError(null);
    setSaveSuccessMessage(null);
  }, []);

  const updateCountryState = useCallback((selection: CountryStateSelection) => {
    setValues((current) => ({
      ...current,
      country: selection.country,
      state: selection.state,
      countryCode: selection.countryCode,
      stateCode: selection.stateCode,
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.country;
      delete next.state;
      return next;
    });
    setSaveError(null);
    setSaveSuccessMessage(null);
  }, []);

  const saveProfile = useCallback(async () => {
    if (!authUserId || isSaving) {
      return false;
    }

    const validationErrors = validateAccountDetailsForm(values);
    setFieldErrors(validationErrors);
    setSaveError(null);
    setSaveSuccessMessage(null);

    if (hasAccountDetailsFormErrors(validationErrors)) {
      return false;
    }

    setIsSaving(true);

    try {
      const body = buildUpdateUserProfileRequest(values);
      const response = await updateUserProfile(authUserId, body);
      const storedProfile = mapUserProfileToStoredProfile(response, authUserId, cachedUser ?? undefined);

      await updateStoredProfile(storedProfile);
      await refreshSession();

      setValues(accountDetailsFormFromProfile(response, storedProfile));
      setSaveSuccessMessage('Account details updated successfully.');
      return true;
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Failed to update account details'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [authUserId, cachedUser, isSaving, refreshSession, values]);

  return {
    values,
    fieldErrors,
    isLoading,
    isSaving,
    loadError,
    saveError,
    saveSuccessMessage,
    updateField,
    updateCountryState,
    saveProfile,
    retry: loadProfile,
  };
}
