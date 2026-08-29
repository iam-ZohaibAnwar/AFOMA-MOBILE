import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  getAdminCommissionById,
  postAdminCommissionKorapayPayoutLink,
  putAdminCommissionPayoutStatus,
} from '../api/adminCommissionApi';
import type {
  AdminCommissionActionError,
  AdminCommissionDisplayRow,
  AdminCommissionDisplayType,
  AdminCommissionRecord,
  AdminCommissionStatusMutation,
} from '../types/adminCommission';
import { mapAdminCommissionRecordsToDisplayRows } from '../utils/adminCommissionDisplayMapper';
import {
  canInitiateAdminCommissionPayout,
  canUpdateAdminCommissionPayoutStatus,
} from '../utils/adminCommissionMutationGuards';
import { buildKorapayPayoutLinkPayload } from '../utils/adminCommissionPayoutPayload';
import { replaceAdminCommissionInPage } from '../utils/adminCommissionRecordMerge';

function resolveDisplayRow(
  record: AdminCommissionRecord,
  commissionId: string,
  displayType: AdminCommissionDisplayType,
  fallback?: AdminCommissionDisplayRow,
): AdminCommissionDisplayRow | undefined {
  const rows = mapAdminCommissionRecordsToDisplayRows([record], '');
  return (
    rows.find((row) => row.commissionId === commissionId && row.type === displayType) ??
    rows.find((row) => row.commissionId === commissionId) ??
    fallback
  );
}

export function useAdminCommissionDetail(
  enabled: boolean,
  commissionId: string | undefined,
  displayType: AdminCommissionDisplayType,
  initialRow?: AdminCommissionDisplayRow,
) {
  const [row, setRow] = useState<AdminCommissionDisplayRow | undefined>(initialRow);
  const [rawRecord, setRawRecord] = useState<AdminCommissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(enabled && !initialRow);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initiatingCommissionId, setInitiatingCommissionId] = useState<string | null>(null);
  const [updatingStatusCommissionId, setUpdatingStatusCommissionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<AdminCommissionActionError | null>(null);

  const rawRecordRef = useRef<AdminCommissionRecord | null>(null);
  const initiatingLockRef = useRef<string | null>(null);
  const updatingStatusLockRef = useRef<string | null>(null);

  useEffect(() => {
    rawRecordRef.current = rawRecord;
  }, [rawRecord]);

  const applyRecord = useCallback(
    (record: AdminCommissionRecord) => {
      if (!commissionId) {
        return;
      }

      setRawRecord(record);
      const nextRow = resolveDisplayRow(record, commissionId, displayType, initialRow);
      if (nextRow) {
        setRow(nextRow);
      }
    },
    [commissionId, displayType, initialRow],
  );

  const loadDetail = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled || !commissionId) {
        setRow(undefined);
        setRawRecord(null);
        setIsLoading(false);
        return;
      }

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!initialRow) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const record = await getAdminCommissionById(commissionId);
        applyRecord(record);
        setError(null);
      } catch (err) {
        if (!initialRow) {
          setRow(undefined);
        }
        setError(getErrorMessage(err, 'Unable to load commission'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyRecord, commissionId, enabled, initialRow],
  );

  useEffect(() => {
    void loadDetail(initialRow ? 'refresh' : 'initial');
  }, [initialRow, loadDetail]);

  const refresh = useCallback(async () => {
    await loadDetail('refresh');
  }, [loadDetail]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const initiatePayout = useCallback(async () => {
    const currentRow = row;
    if (
      !currentRow ||
      initiatingLockRef.current === currentRow.commissionId ||
      !canInitiateAdminCommissionPayout(currentRow, initiatingCommissionId)
    ) {
      return false;
    }

    initiatingLockRef.current = currentRow.commissionId;
    setActionError(null);
    setInitiatingCommissionId(currentRow.commissionId);

    try {
      const sourceRecords = rawRecordRef.current ? [rawRecordRef.current] : [];
      const payload = buildKorapayPayoutLinkPayload(
        sourceRecords,
        currentRow.commissionId,
        '',
      );

      if (!payload) {
        throw new Error('Could not build payout payload for this commission');
      }

      await postAdminCommissionKorapayPayoutLink(payload);
      await loadDetail('refresh');
      return true;
    } catch (err) {
      setActionError({
        commissionId: currentRow.commissionId,
        kind: 'initiate',
        message: getErrorMessage(err, 'Failed to send payout link'),
      });
      return false;
    } finally {
      initiatingLockRef.current = null;
      setInitiatingCommissionId(null);
    }
  }, [initiatingCommissionId, loadDetail, row]);

  const updatePayoutStatus = useCallback(
    async (newPayoutStatus: AdminCommissionStatusMutation) => {
      const currentRow = row;
      if (
        !currentRow ||
        updatingStatusLockRef.current === currentRow.commissionId ||
        !canUpdateAdminCommissionPayoutStatus(currentRow, updatingStatusCommissionId) ||
        currentRow.payoutStatus === 'Paid'
      ) {
        return false;
      }

      if (currentRow.payoutStatus === newPayoutStatus) {
        return true;
      }

      updatingStatusLockRef.current = currentRow.commissionId;
      setActionError(null);
      setUpdatingStatusCommissionId(currentRow.commissionId);

      try {
        const updated = await putAdminCommissionPayoutStatus(currentRow.commissionId, newPayoutStatus);
        if (rawRecordRef.current) {
          const merged = replaceAdminCommissionInPage([rawRecordRef.current], updated)[0];
          if (merged) {
            applyRecord(merged);
          }
        } else {
          applyRecord(updated);
        }
        return true;
      } catch (err) {
        setActionError({
          commissionId: currentRow.commissionId,
          kind: 'status',
          message: getErrorMessage(err, 'Failed to update payout status'),
        });
        return false;
      } finally {
        updatingStatusLockRef.current = null;
        setUpdatingStatusCommissionId(null);
      }
    },
    [applyRecord, row, updatingStatusCommissionId],
  );

  return {
    row: row ?? initialRow,
    isLoading,
    isRefreshing,
    error,
    refresh,
    initiatingCommissionId,
    updatingStatusCommissionId,
    actionError,
    clearActionError,
    initiatePayout,
    updatePayoutStatus,
  };
}
