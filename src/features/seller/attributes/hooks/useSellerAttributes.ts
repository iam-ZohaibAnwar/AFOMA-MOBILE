import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import {
  addSellerAttribute,
  deleteSellerAttribute,
  getSellerAttributes,
  updateSellerAttribute,
} from '../api/sellerAttributesApi';
import type { SellerAttributeListItem } from '../types/sellerAttribute';
import {
  getDuplicateAttributeError,
  normalizeAttributeName,
  validateAttributeName,
} from '../utils/sellerAttributeValidation';

export function useSellerAttributes(sellerId?: string) {
  const [attributes, setAttributes] = useState<SellerAttributeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(sellerId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState<number | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const loadAttributes = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!sellerId) {
        setAttributes([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const requestVersion = requestVersionRef.current + 1;
      requestVersionRef.current = requestVersion;

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const nextAttributes = await getSellerAttributes(sellerId);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setAttributes(nextAttributes);
      } catch (err) {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setAttributes([]);
        setError(getErrorMessage(err, 'Failed to load custom attributes'));
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [sellerId],
  );

  useEffect(() => {
    void loadAttributes('initial');
  }, [loadAttributes]);

  const refresh = useCallback(async () => {
    await loadAttributes('refresh');
  }, [loadAttributes]);

  const validateNameForSave = useCallback(
    (name: string, excludeIndex?: number): string | null => {
      const validationError = validateAttributeName(name);
      if (validationError) {
        return validationError;
      }

      const duplicateError = getDuplicateAttributeError(
        name,
        attributes.map((attribute) => attribute.name),
        excludeIndex,
      );

      return duplicateError;
    },
    [attributes],
  );

  const createAttribute = useCallback(
    async (rawName: string): Promise<boolean> => {
      if (!sellerId || isAdding) {
        return false;
      }

      const name = normalizeAttributeName(rawName);
      const validationError = validateNameForSave(name);
      if (validationError) {
        setActionError(validationError);
        return false;
      }

      setIsAdding(true);
      setActionError(null);

      try {
        await addSellerAttribute(sellerId, { attributes: name });
        await loadAttributes('refresh');
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to add attribute'));
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [isAdding, loadAttributes, sellerId, validateNameForSave],
  );

  const renameAttribute = useCallback(
    async (index: number, rawName: string): Promise<boolean> => {
      if (!sellerId || updatingIndex != null) {
        return false;
      }

      const name = normalizeAttributeName(rawName);
      const validationError = validateNameForSave(name, index);
      if (validationError) {
        setActionError(validationError);
        return false;
      }

      setUpdatingIndex(index);
      setActionError(null);

      try {
        await updateSellerAttribute(sellerId, {
          updatedAttributeValue: name,
          indexToUpdate: index,
        });
        await loadAttributes('refresh');
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to update attribute'));
        return false;
      } finally {
        setUpdatingIndex(null);
      }
    },
    [loadAttributes, sellerId, updatingIndex, validateNameForSave],
  );

  const removeAttribute = useCallback(
    async (attributeName: string): Promise<boolean> => {
      if (!sellerId || deletingName) {
        return false;
      }

      setDeletingName(attributeName);
      setActionError(null);

      try {
        await deleteSellerAttribute(sellerId, { attributes: attributeName });
        await loadAttributes('refresh');
        return true;
      } catch (err) {
        setActionError(getErrorMessage(err, 'Failed to delete attribute'));
        return false;
      } finally {
        setDeletingName(null);
      }
    },
    [deletingName, loadAttributes, sellerId],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    attributes,
    isLoading,
    isRefreshing,
    isAdding,
    updatingIndex,
    deletingName,
    error,
    actionError,
    refresh,
    createAttribute,
    renameAttribute,
    removeAttribute,
    clearActionError,
  };
}
