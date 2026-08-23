import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, getErrorMessage } from '../../../../services/api/errors';
import { createAdminUser, getAdminUserById, updateAdminUserByAdmin } from '../api/adminUserManagementApi';
import type { AdminUserFormMode, AdminUserListItem } from '../types/adminUserManagement';
import {
  ADMIN_USER_CREATE_INITIAL_VALUES,
  type AdminUserFormField,
  type AdminUserFormFieldErrors,
  type AdminUserFormValues,
} from '../types/adminUserForm';
import { requestAdminUserListRefresh } from '../state/adminUserListRefresh';
import { applyAdminUserSessionPatch, clearAdminUserSessionPatch, setAdminUserSessionPatch } from '../state/adminUserSessionPatch';
import {
  buildAdminUserCreatePayload,
  buildAdminUserUpdatePayload,
  mapAdminUserToFormValues,
  validateAdminUserForm,
} from '../utils/adminUserForm';
import { useAdminUserProfileUpload } from './useAdminUserProfileUpload';

export interface UseAdminUserFormOptions {
  mode: AdminUserFormMode;
  userId?: string;
  initialUser?: AdminUserListItem;
  creatorRole?: string;
}

function resolveInitialFormValues(
  mode: AdminUserFormMode,
  initialUser?: AdminUserListItem,
): AdminUserFormValues {
  if (mode !== 'edit' || !initialUser) {
    return ADMIN_USER_CREATE_INITIAL_VALUES;
  }

  const patched = applyAdminUserSessionPatch(initialUser) ?? initialUser;
  return mapAdminUserToFormValues(patched);
}

export function useAdminUserForm({
  mode,
  userId,
  initialUser,
  creatorRole = 'admin',
}: UseAdminUserFormOptions) {
  const isEditMode = mode === 'edit';
  const isDirtyRef = useRef(false);

  const [values, setValues] = useState<AdminUserFormValues>(() =>
    resolveInitialFormValues(mode, initialUser),
  );
  const [fieldErrors, setFieldErrors] = useState<AdminUserFormFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrating, setIsHydrating] = useState(isEditMode && Boolean(userId) && !initialUser);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const profileUpload = useAdminUserProfileUpload();

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    isDirtyRef.current = false;
    setFieldErrors({});
    setSubmitError(null);
    setHydrationError(null);

    if (initialUser) {
      const patched = applyAdminUserSessionPatch(initialUser) ?? initialUser;
      setValues(mapAdminUserToFormValues(patched));
    } else {
      setValues(ADMIN_USER_CREATE_INITIAL_VALUES);
    }
  }, [initialUser, isEditMode, userId]);

  const hydrateFromServer = useCallback(
    async (options?: { blocking?: boolean }) => {
      if (!isEditMode || !userId) {
        return;
      }

      if (options?.blocking ?? !initialUser) {
        setIsHydrating(true);
      }

      setHydrationError(null);

      try {
        const response = await getAdminUserById(userId);
        const merged = applyAdminUserSessionPatch(response) ?? response;

        if (!isDirtyRef.current) {
          setValues(mapAdminUserToFormValues(merged));
        }
      } catch (err) {
        const notFound = err instanceof ApiError && err.statusCode === 404;
        const message = notFound
          ? 'User not found.'
          : getErrorMessage(err, 'Failed to load user');

        if (notFound) {
          clearAdminUserSessionPatch(userId);
        }

        setHydrationError(message);
      } finally {
        setIsHydrating(false);
      }
    },
    [initialUser, isEditMode, userId],
  );

  useEffect(() => {
    if (!isEditMode || !userId) {
      return;
    }

    void hydrateFromServer();
  }, [hydrateFromServer, isEditMode, userId]);

  const retryHydration = useCallback(() => {
    void hydrateFromServer({ blocking: true });
  }, [hydrateFromServer]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const updateField = useCallback(
    <K extends AdminUserFormField>(key: K, value: AdminUserFormValues[K]) => {
      markDirty();
      setValues((current) => {
        const next = { ...current, [key]: value };

        if (key === 'userRole' && value !== 'admin') {
          next.fullAccess = false;
        }

        return next;
      });

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
    [markDirty],
  );

  const updateAddressRegion = useCallback(
    (selection: Pick<AdminUserFormValues, 'country' | 'countryCode' | 'state' | 'stateCode'>) => {
      markDirty();
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
    [markDirty],
  );

  const pickProfilePhoto = useCallback(async () => {
    profileUpload.clearUploadError();
    const result = await profileUpload.pickProfilePhoto();
    if (!result) {
      return;
    }

    markDirty();
    setValues((current) => ({
      ...current,
      profileLocalUri: result.localUri,
      userProfile: result.imageUrl ?? current.userProfile,
    }));
    setSubmitError(null);
  }, [markDirty, profileUpload]);

  const retryProfileUpload = useCallback(async () => {
    if (!values.profileLocalUri) {
      return;
    }

    profileUpload.clearUploadError();
    const imageUrl = await profileUpload.uploadLocalImage(values.profileLocalUri);
    if (imageUrl) {
      markDirty();
      setValues((current) => ({
        ...current,
        userProfile: imageUrl,
      }));
    }
  }, [markDirty, profileUpload, values.profileLocalUri]);

  const removeProfilePhoto = useCallback(() => {
    if (profileUpload.isUploading) {
      return;
    }

    profileUpload.clearUploadError();
    markDirty();
    setValues((current) => ({
      ...current,
      profileLocalUri: '',
      userProfile: '',
    }));
  }, [markDirty, profileUpload]);

  const ensureProfileUploaded = useCallback(async (): Promise<string | null | undefined> => {
    if (values.userProfile.trim()) {
      return values.userProfile.trim();
    }

    if (!values.profileLocalUri) {
      return undefined;
    }

    const imageUrl = await profileUpload.uploadLocalImage(values.profileLocalUri);
    if (!imageUrl) {
      setSubmitError('Profile photo upload failed. Retry the upload before saving.');
      return null;
    }

    setValues((current) => ({
      ...current,
      userProfile: imageUrl,
    }));
    return imageUrl;
  }, [profileUpload, values.profileLocalUri, values.userProfile]);

  const submitCreateUser = useCallback(async (): Promise<AdminUserListItem | null> => {
    if (isSaving || isEditMode || profileUpload.isUploading) {
      return null;
    }

    const errors = validateAdminUserForm(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      const uploadedProfile = await ensureProfileUploaded();
      if (uploadedProfile === null) {
        return null;
      }

      const payload = buildAdminUserCreatePayload({
        ...values,
        userProfile: uploadedProfile ?? values.userProfile,
      });

      const created = await createAdminUser(payload, creatorRole);
      const createdId = created._id;

      if (createdId) {
        setAdminUserSessionPatch(createdId, created);
      }

      requestAdminUserListRefresh({ resetToFirstPage: true });
      return created;
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to create user'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [creatorRole, ensureProfileUploaded, isEditMode, isSaving, profileUpload.isUploading, values]);

  const submitUpdateUser = useCallback(async (): Promise<AdminUserListItem | null> => {
    if (isSaving || !isEditMode || !userId || profileUpload.isUploading) {
      return null;
    }

    const errors = validateAdminUserForm(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setSubmitError('Please fix the highlighted fields before saving.');
      return null;
    }

    setIsSaving(true);
    setSubmitError(null);

    try {
      const uploadedProfile = await ensureProfileUploaded();
      if (uploadedProfile === null) {
        return null;
      }

      const payload = buildAdminUserUpdatePayload({
        ...values,
        userProfile: uploadedProfile ?? values.userProfile,
      });

      const updated = await updateAdminUserByAdmin(userId, payload);

      setAdminUserSessionPatch(userId, updated);
      requestAdminUserListRefresh();
      isDirtyRef.current = false;
      return updated;
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Failed to update user'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [ensureProfileUploaded, isEditMode, isSaving, profileUpload.isUploading, userId, values]);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    mode,
    values,
    fieldErrors,
    submitError,
    isSaving,
    isHydrating,
    hydrationError,
    isUploadingProfile: profileUpload.isUploading,
    profileUploadError: profileUpload.uploadError,
    updateField,
    updateAddressRegion,
    pickProfilePhoto,
    retryProfileUpload,
    removeProfilePhoto,
    submitCreateUser,
    submitUpdateUser,
    retryHydration,
    clearSubmitError,
    clearProfileUploadError: profileUpload.clearUploadError,
  };
}

/** @deprecated Use useAdminUserForm */
export function useAdminUserCreateForm(creatorRole: string) {
  return useAdminUserForm({ mode: 'create', creatorRole });
}
