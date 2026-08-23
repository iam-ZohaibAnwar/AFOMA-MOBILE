import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminCommissionRateSettingType } from '../types/adminSettings';
import { parseAdminCommissionRateInput, sanitizeAdminCommissionRateInput } from '../utils/adminCommissionRateInput';
import { validateAdminCommissionRateValue } from '../utils/adminSettingsContent';
import { useAdminCommissionRateSetting } from './useAdminSettingByType';

interface UseAdminCommissionRateEditorOptions {
  enabled: boolean;
  createdBy: string | undefined;
}

export function useAdminCommissionRateEditor(
  rateType: AdminCommissionRateSettingType,
  { enabled, createdBy }: UseAdminCommissionRateEditorOptions,
) {
  const setting = useAdminCommissionRateSetting(rateType, { enabled });
  const [inputValue, setInputValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    hydratedRef.current = false;
    setInputValue('');
    setIsDirty(false);
    setFieldError(null);
    setSaveError(null);
  }, [rateType]);

  useEffect(() => {
    if (setting.isLoading || isDirty || hydratedRef.current) {
      return;
    }

    setInputValue(setting.value != null ? String(setting.value) : '');
    hydratedRef.current = true;
  }, [isDirty, setting.isLoading, setting.value]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || isDirty || isSaving) {
        return;
      }

      hydratedRef.current = false;
      void setting.refresh();
    }, [enabled, isDirty, isSaving, setting.refresh]),
  );

  const handleInputChange = useCallback((nextRaw: string) => {
    setInputValue(sanitizeAdminCommissionRateInput(nextRaw));
    setIsDirty(true);
    setFieldError(null);
    setSaveError(null);
  }, []);

  const save = useCallback(async () => {
    if (!createdBy) {
      setSaveError('Admin session is missing a user id.');
      return false;
    }

    const numeric = parseAdminCommissionRateInput(inputValue);
    if (numeric == null) {
      setFieldError('Enter a commission percentage.');
      return false;
    }

    const validationError = validateAdminCommissionRateValue(numeric);
    if (validationError) {
      setFieldError(validationError);
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    setFieldError(null);

    try {
      await setting.saveRate(numeric, createdBy);
      await setting.refresh();
      setInputValue(String(numeric));
      setIsDirty(false);
      hydratedRef.current = true;
      return true;
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Failed to save commission rate'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [createdBy, inputValue, setting]);

  const canSave = Boolean(createdBy) && isDirty && !isSaving && parseAdminCommissionRateInput(inputValue) != null;

  return {
    ...setting,
    inputValue,
    fieldError,
    saveError,
    isSaving,
    isDirty,
    canSave,
    handleInputChange,
    save,
    clearSaveError: () => setSaveError(null),
  };
}
