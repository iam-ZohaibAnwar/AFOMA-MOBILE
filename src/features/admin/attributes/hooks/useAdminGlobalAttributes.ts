import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  addGlobalAttributeName,
  deleteGlobalAttributeName,
  getGlobalAttributeDocument,
  renameGlobalAttributeAtIndex,
} from '../api/adminGlobalAttributesApi';
import type { GlobalAttributeDocument, GlobalAttributeEntry } from '../types/adminGlobalAttributes';
import {
  parseGlobalAttributeDocument,
  parseGlobalAttributeNames,
} from '../utils/adminGlobalAttributesContent';

interface UseAdminGlobalAttributesOptions {
  enabled: boolean;
}

export function useAdminGlobalAttributes({ enabled }: UseAdminGlobalAttributesOptions) {
  const [document, setDocument] = useState<GlobalAttributeDocument | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [renamingRawIndex, setRenamingRawIndex] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);
  const documentRef = useRef<GlobalAttributeDocument | null>(null);

  documentRef.current = document;

  const parsed = useMemo(() => parseGlobalAttributeDocument(document), [document]);
  const documentId = parsed.documentId;
  const attributeNames = parsed.attributeNames;
  const entries: GlobalAttributeEntry[] = parsed.entries;

  const applyDocument = useCallback((nextDocument: GlobalAttributeDocument | null) => {
    setDocument(nextDocument);
    documentRef.current = nextDocument;
  }, []);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const hasCachedDocument = Boolean(documentRef.current);

      if (mode === 'initial' && !hasCachedDocument) {
        setIsLoading(true);
      } else if (mode === 'refresh') {
        setIsRefreshing(true);
      }

      try {
        const nextDocument = await getGlobalAttributeDocument();

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        applyDocument(nextDocument);
        setError(null);
      } catch (loadError) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (!documentRef.current) {
          setError(getErrorMessage(loadError, 'Failed to load global attributes'));
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [applyDocument, enabled],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(async () => {
    await load('refresh');
  }, [load]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const addAttributeName = useCallback(
    async (attributeName: string): Promise<boolean> => {
      if (!documentId || isAdding) {
        return false;
      }

      setIsAdding(true);
      setActionError(null);

      try {
        const nextDocument = await addGlobalAttributeName(documentId, attributeName);
        applyDocument(nextDocument);
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to add global attribute'));
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [applyDocument, documentId, isAdding],
  );

  const renameAttributeAtIndex = useCallback(
    async (rawIndex: number, updatedAttributeValue: string): Promise<boolean> => {
      if (!documentId || renamingRawIndex != null) {
        return false;
      }

      setRenamingRawIndex(rawIndex);
      setActionError(null);

      try {
        const nextDocument = await renameGlobalAttributeAtIndex(
          documentId,
          rawIndex,
          updatedAttributeValue,
        );
        applyDocument(nextDocument);
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to rename global attribute'));
        return false;
      } finally {
        setRenamingRawIndex(null);
      }
    },
    [applyDocument, documentId, renamingRawIndex],
  );

  const deleteAttributeName = useCallback(
    async (attributeName: string): Promise<boolean> => {
      if (!documentId || deletingName) {
        return false;
      }

      const beforeNames = parseGlobalAttributeNames(documentRef.current?.attributes);
      const hadExactName = beforeNames.includes(attributeName);

      setDeletingName(attributeName);
      setActionError(null);

      try {
        const nextDocument = await deleteGlobalAttributeName(documentId, attributeName);
        applyDocument(nextDocument);

        if (!hadExactName) {
          setActionError('That attribute was not found. The list has been refreshed.');
          return false;
        }

        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to delete global attribute'));
        return false;
      } finally {
        setDeletingName(null);
      }
    },
    [applyDocument, deletingName, documentId],
  );

  return {
    document,
    documentId,
    attributeNames,
    entries,
    isLoading,
    isRefreshing,
    isAdding,
    renamingRawIndex,
    deletingName,
    error,
    actionError,
    refresh,
    addAttributeName,
    renameAttributeAtIndex,
    deleteAttributeName,
    clearActionError,
  };
}
