import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { changeAdminSellerApprovalStatus } from '../api/adminSellerManagementApi';
import type { AdminSellerApprovalChoice, AdminSellerListItem } from '../types/adminSellerManagement';
import { resolveAdminSellerChangeStatusPayload } from '../utils/adminSellerApproval';
import { setAdminSellerSessionPatch } from '../state/adminSellerSessionPatch';

export function useAdminSellerApproval(sellerId?: string) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeApprovalStatus = useCallback(
    async (
      nextStatus: AdminSellerApprovalChoice,
      currentStatus?: AdminSellerListItem['status'],
    ): Promise<Partial<AdminSellerListItem> | null> => {
      if (!sellerId) {
        return null;
      }

      if (currentStatus === nextStatus) {
        return null;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const payload = resolveAdminSellerChangeStatusPayload(nextStatus);
        await changeAdminSellerApprovalStatus(sellerId, payload);

        const patch: Partial<AdminSellerListItem> = {
          status: nextStatus,
          userRole: payload.userRole,
        };

        setAdminSellerSessionPatch(sellerId, patch);
        return patch;
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update approval status'));
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [sellerId],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUpdating,
    error,
    changeApprovalStatus,
    clearError,
  };
}
