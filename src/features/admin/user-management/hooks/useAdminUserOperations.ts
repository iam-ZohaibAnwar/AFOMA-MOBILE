import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { deleteAdminUser } from '../api/adminUserManagementApi';
import { requestAdminUserListRefresh } from '../state/adminUserListRefresh';
import { clearAdminUserSessionPatch } from '../state/adminUserSessionPatch';

export function useAdminUserOperations() {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: string) => {
    if (deletingUserId) {
      return false;
    }

    setActionError(null);
    setDeletingUserId(userId);

    try {
      await deleteAdminUser(userId);
      clearAdminUserSessionPatch(userId);
      requestAdminUserListRefresh();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete user'));
      return false;
    } finally {
      setDeletingUserId(null);
    }
  }, [deletingUserId]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    deletingUserId,
    deleteUser,
    actionError,
    clearActionError,
  };
}
