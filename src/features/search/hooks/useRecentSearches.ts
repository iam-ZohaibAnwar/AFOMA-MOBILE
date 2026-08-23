import { useCallback, useEffect, useState } from 'react';

import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from '../../../services/storage/recentSearchStorage';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const items = await getRecentSearches();
    setRecentSearches(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSearch = useCallback(async (term: string) => {
    const next = await addRecentSearch(term);
    setRecentSearches(next);
    return next;
  }, []);

  const removeSearch = useCallback(async (term: string) => {
    const next = await removeRecentSearch(term);
    setRecentSearches(next);
    return next;
  }, []);

  const clearAll = useCallback(async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    isLoading,
    refresh,
    saveSearch,
    removeSearch,
    clearAll,
  };
}
