import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  ADMIN_COMMISSION_LIST_PAGE_SIZE,
  getAdminCommissionById,
  getAdminCommissionList,
  getAdminCommissionTotalAmount,
  postAdminCommissionKorapayPayoutLink,
  putAdminCommissionPayoutStatus,
} from '../api/adminCommissionApi';
import type {
  AdminCommissionActionError,
  AdminCommissionDisplayRow,
  AdminCommissionManagementParams,
  AdminCommissionPayoutStatusFilter,
  AdminCommissionRecipientRoleFilter,
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

const SEARCH_DEBOUNCE_MS = 300;

function buildListQueryKey(
  page: number,
  searchTerm: string,
  payoutStatusFilter: AdminCommissionPayoutStatusFilter,
  roleFilter: AdminCommissionRecipientRoleFilter,
): string {
  return `${page}|${searchTerm}|${payoutStatusFilter}|${roleFilter}`;
}

function mapPageRecords(
  records: AdminCommissionRecord[],
  roleFilter: AdminCommissionRecipientRoleFilter,
): AdminCommissionDisplayRow[] {
  return mapAdminCommissionRecordsToDisplayRows(records, roleFilter);
}

export function useAdminCommissionList(
  enabled: boolean,
  params?: AdminCommissionManagementParams,
) {
  const [rawCommissions, setRawCommissions] = useState<AdminCommissionRecord[]>([]);
  const [displayRows, setDisplayRows] = useState<AdminCommissionDisplayRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<AdminCommissionPayoutStatusFilter>(
    params?.initialPayoutStatus ?? '',
  );
  const [roleFilter, setRoleFilter] = useState<AdminCommissionRecipientRoleFilter>('');
  const [initiatingCommissionId, setInitiatingCommissionId] = useState<string | null>(null);
  const [updatingStatusCommissionId, setUpdatingStatusCommissionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<AdminCommissionActionError | null>(null);

  const requestVersionRef = useRef(0);
  const activeQueryKeyRef = useRef('');
  const hasCachedRowsRef = useRef(false);
  const rawCommissionsRef = useRef<AdminCommissionRecord[]>([]);
  const roleFilterRef = useRef(roleFilter);
  const initiatingLockRef = useRef<string | null>(null);
  const updatingStatusLockRef = useRef<string | null>(null);

  useEffect(() => {
    rawCommissionsRef.current = rawCommissions;
  }, [rawCommissions]);

  useEffect(() => {
    roleFilterRef.current = roleFilter;
  }, [roleFilter]);

  const applyRawCommissions = useCallback(
    (records: AdminCommissionRecord[], nextRoleFilter = roleFilterRef.current) => {
      setRawCommissions(records);
      setDisplayRows(mapPageRecords(records, nextRoleFilter));
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadSummary = useCallback(async (requestVersion: number) => {
    try {
      const totalResponse = await getAdminCommissionTotalAmount();

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      const amountValue = totalResponse.totalCommission;
      setTotalCommissionAmount(
        amountValue === undefined || amountValue === null ? null : Number(amountValue),
      );
      setSummaryError(null);
    } catch (err) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setSummaryError(getErrorMessage(err, 'Failed to load total commission'));
    }
  }, []);

  const loadPage = useCallback(
    async (page: number, mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setRawCommissions([]);
        setDisplayRows([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const queryKey = buildListQueryKey(page, searchTerm, payoutStatusFilter, roleFilter);
      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;
      activeQueryKeyRef.current = queryKey;

      const hasCachedRows = hasCachedRowsRef.current;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (!hasCachedRows) {
        setIsLoading(true);
        setError(null);
      }

      try {
        let resolvedPage = page;
        let listResponse = await getAdminCommissionList({
          page: resolvedPage,
          limit: ADMIN_COMMISSION_LIST_PAGE_SIZE,
          search: searchTerm || undefined,
          payoutStatus: payoutStatusFilter || undefined,
          role: roleFilter || undefined,
        });

        const maxPage = Math.max(1, listResponse.totalPages ?? 1);
        if (resolvedPage > maxPage) {
          resolvedPage = maxPage;
          listResponse = await getAdminCommissionList({
            page: resolvedPage,
            limit: ADMIN_COMMISSION_LIST_PAGE_SIZE,
            search: searchTerm || undefined,
            payoutStatus: payoutStatusFilter || undefined,
            role: roleFilter || undefined,
          });
        }

        if (
          requestVersion !== requestVersionRef.current ||
          activeQueryKeyRef.current !== queryKey
        ) {
          return;
        }

        const nextRawCommissions = Array.isArray(listResponse.commissions)
          ? listResponse.commissions
          : [];

        applyRawCommissions(nextRawCommissions, roleFilter);
        setTotalPages(Math.max(1, listResponse.totalPages ?? 1));
        setTotalCommissions(listResponse.totalCommissions ?? nextRawCommissions.length);
        setCurrentPage(resolvedPage);
        hasCachedRowsRef.current = true;
        setError(null);

        void loadSummary(requestVersion);
      } catch (err) {
        if (
          requestVersion !== requestVersionRef.current ||
          activeQueryKeyRef.current !== queryKey
        ) {
          return;
        }

        if (!hasCachedRowsRef.current) {
          setRawCommissions([]);
          setDisplayRows([]);
        }

        setError(getErrorMessage(err, 'Unable to load commissions'));
      } finally {
        if (
          requestVersion === requestVersionRef.current &&
          activeQueryKeyRef.current === queryKey
        ) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [applyRawCommissions, enabled, loadSummary, payoutStatusFilter, roleFilter, searchTerm],
  );

  useEffect(() => {
    setCurrentPage(1);
    setActionError(null);
    void loadPage(1, hasCachedRowsRef.current ? 'refresh' : 'initial');
  }, [loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(currentPage, 'refresh');
  }, [currentPage, loadPage]);

  const retrySummary = useCallback(async () => {
    await loadSummary(requestVersionRef.current);
  }, [loadSummary]);

  const reconcileCommissionRecord = useCallback(
    async (commissionId: string) => {
      try {
        const fetched = await getAdminCommissionById(commissionId);
        const mergedPage = replaceAdminCommissionInPage(rawCommissionsRef.current, fetched);
        applyRawCommissions(mergedPage, roleFilterRef.current);
      } catch {
        await loadPage(currentPage, 'refresh');
      }
    },
    [applyRawCommissions, currentPage, loadPage],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const initiatePayout = useCallback(
    async (row: AdminCommissionDisplayRow) => {
      if (
        initiatingLockRef.current === row.commissionId ||
        !canInitiateAdminCommissionPayout(row, initiatingCommissionId)
      ) {
        return false;
      }

      initiatingLockRef.current = row.commissionId;
      setActionError(null);
      setInitiatingCommissionId(row.commissionId);

      try {
        const payload = buildKorapayPayoutLinkPayload(
          rawCommissionsRef.current,
          row.commissionId,
          roleFilterRef.current,
        );

        if (!payload) {
          throw new Error('Could not build payout payload for this commission');
        }

        await postAdminCommissionKorapayPayoutLink(payload);
        await reconcileCommissionRecord(row.commissionId);
        return true;
      } catch (err) {
        setActionError({
          commissionId: row.commissionId,
          kind: 'initiate',
          message: getErrorMessage(err, 'Failed to send payout link'),
        });
        return false;
      } finally {
        initiatingLockRef.current = null;
        setInitiatingCommissionId(null);
      }
    },
    [initiatingCommissionId, reconcileCommissionRecord],
  );

  const updatePayoutStatus = useCallback(
    async (row: AdminCommissionDisplayRow, newPayoutStatus: AdminCommissionStatusMutation) => {
      if (
        updatingStatusLockRef.current === row.commissionId ||
        !canUpdateAdminCommissionPayoutStatus(row, updatingStatusCommissionId)
      ) {
        return false;
      }

      if (row.payoutStatus === newPayoutStatus) {
        return true;
      }

      updatingStatusLockRef.current = row.commissionId;
      setActionError(null);
      setUpdatingStatusCommissionId(row.commissionId);

      try {
        const updated = await putAdminCommissionPayoutStatus(row.commissionId, newPayoutStatus);
        const mergedPage = replaceAdminCommissionInPage(rawCommissionsRef.current, updated);
        applyRawCommissions(mergedPage, roleFilterRef.current);
        void loadPage(currentPage, 'refresh');
        return true;
      } catch (err) {
        setActionError({
          commissionId: row.commissionId,
          kind: 'status',
          message: getErrorMessage(err, 'Failed to update payout status'),
        });
        return false;
      } finally {
        updatingStatusLockRef.current = null;
        setUpdatingStatusCommissionId(null);
      }
    },
    [applyRawCommissions, currentPage, loadPage, updatingStatusCommissionId],
  );

  const goToPreviousPage = useCallback(() => {
    const nextPage = Math.max(1, currentPage - 1);
    if (nextPage === currentPage) {
      return;
    }

    void loadPage(nextPage, hasCachedRowsRef.current ? 'refresh' : 'initial');
  }, [currentPage, loadPage]);

  const goToNextPage = useCallback(() => {
    const nextPage = Math.min(totalPages, currentPage + 1);
    if (nextPage === currentPage) {
      return;
    }

    void loadPage(nextPage, hasCachedRowsRef.current ? 'refresh' : 'initial');
  }, [currentPage, loadPage, totalPages]);

  const applyPayoutStatusFilter = useCallback((nextStatus: AdminCommissionPayoutStatusFilter) => {
    setPayoutStatusFilter(nextStatus);
  }, []);

  const applyRoleFilter = useCallback((nextRole: AdminCommissionRecipientRoleFilter) => {
    setRoleFilter(nextRole);
  }, []);

  const clearFilters = useCallback(() => {
    setPayoutStatusFilter('');
    setRoleFilter('');
  }, []);

  const hasActiveFilters = useMemo(
    () => Boolean(payoutStatusFilter || roleFilter),
    [payoutStatusFilter, roleFilter],
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return {
    displayRows,
    currentPage,
    totalPages,
    totalCommissions,
    totalCommissionAmount,
    isLoading,
    isRefreshing,
    error,
    summaryError,
    searchInput,
    setSearchInput,
    payoutStatusFilter,
    roleFilter,
    hasActiveFilters,
    applyPayoutStatusFilter,
    applyRoleFilter,
    clearFilters,
    refresh,
    retrySummary,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
    initiatingCommissionId,
    updatingStatusCommissionId,
    actionError,
    clearActionError,
    initiatePayout,
    updatePayoutStatus,
  };
}
