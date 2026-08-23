import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { ADMIN_CSV_SCHEMA_OPTIONS, type AdminCsvSchema } from '../types/adminCsvExport';
import {
  downloadAndShareAdminCsv,
} from '../utils/adminCsvExportDownload';
import { validateAdminCsvDateInput } from '../utils/adminCsvExportValidation';

export function useAdminCsvExport() {
  const [schema, setSchema] = useState<AdminCsvSchema | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedLabel =
    ADMIN_CSV_SCHEMA_OPTIONS.find((option) => option.value === schema)?.label ?? null;

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
    setFieldError(null);
    setError(null);
  }, []);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
    setFieldError(null);
    setError(null);
  }, []);

  const handleSchemaChange = useCallback((nextSchema: AdminCsvSchema) => {
    setSchema(nextSchema);
    setFieldError(null);
    setError(null);
  }, []);

  const download = useCallback(async () => {
    if (!schema) {
      setFieldError('Select a schema to export.');
      return false;
    }

    const fromError = validateAdminCsvDateInput(fromDate);
    if (fromError) {
      setFieldError(`From date: ${fromError}`);
      return false;
    }

    const toError = validateAdminCsvDateInput(toDate);
    if (toError) {
      setFieldError(`To date: ${toError}`);
      return false;
    }

    setIsDownloading(true);
    setFieldError(null);
    setError(null);

    try {
      await downloadAndShareAdminCsv({
        schema,
        fromDate: fromDate.trim() || undefined,
        toDate: toDate.trim() || undefined,
      });
      return true;
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, 'Failed to download CSV'));
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [fromDate, schema, toDate]);

  return {
    schema,
    selectedLabel,
    fromDate,
    toDate,
    fieldError,
    error,
    isDownloading,
    canDownload: Boolean(schema) && !isDownloading,
    setSchema: handleSchemaChange,
    setFromDate: handleFromDateChange,
    setToDate: handleToDateChange,
    download,
    clearError: () => setError(null),
  };
}
