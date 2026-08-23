import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../services/api/errors';
import { getSettingsByType, parseSettingsHtmlContent } from '../../../services/api/settingsApi';
import {
  getTermsConditionsCache,
  setTermsConditionsCache,
} from '../../../services/cache/screenCache';

const TERMS_SETTINGS_TYPE = 'terms-conditions';

export function useTermsConditions() {
  const initialCache = getTermsConditionsCache();
  const [htmlContent, setHtmlContent] = useState(initialCache ?? '');
  const [isLoading, setIsLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);

  const loadTerms = useCallback(async () => {
    const cached = getTermsConditionsCache();
    setError(null);
    if (!cached) {
      setIsLoading(true);
    }

    try {
      const response = await getSettingsByType(TERMS_SETTINGS_TYPE);
      const rawContent = response.settings?.[0]?.content;
      const parsed = parseSettingsHtmlContent(rawContent);

      if (!parsed) {
        setHtmlContent('');
        setError('Terms & Conditions are not available right now.');
        return;
      }

      setHtmlContent(parsed);
      setTermsConditionsCache(parsed);
    } catch (err) {
      if (!getTermsConditionsCache()) {
        setHtmlContent('');
      }
      setError(getErrorMessage(err, 'Failed to load Terms & Conditions'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTerms();
  }, [loadTerms]);

  return {
    htmlContent,
    isLoading,
    error,
    reload: loadTerms,
  };
}
