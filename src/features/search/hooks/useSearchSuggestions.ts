import { useEffect, useState } from 'react';

import {
  MIN_SUGGESTION_QUERY_LENGTH,
  SEARCH_SUGGESTION_DEBOUNCE_MS,
  TRENDING_SEARCH_TERMS,
} from '../../../constants/searchDefaults';
import { globalProductSearch } from '../../../services/api/productsApi';
import { getErrorMessage } from '../../../services/api/errors';
import { extractSearchSuggestions, filterMatchingTerms } from '../utils/searchSuggestions';

export function useSearchSuggestions(query: string, recentSearches: string[]) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_SUGGESTION_QUERY_LENGTH) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await globalProductSearch(trimmedQuery);
        if (cancelled) {
          return;
        }

        const productSuggestions = extractSearchSuggestions(
          trimmedQuery,
          response.matchedProducts ?? [],
        );
        const localMatches = filterMatchingTerms(trimmedQuery, [
          ...recentSearches,
          ...TRENDING_SEARCH_TERMS,
        ]);

        const merged = [...productSuggestions];
        for (const term of localMatches) {
          if (!merged.some((item) => item.toLowerCase() === term.toLowerCase())) {
            merged.push(term);
          }
          if (merged.length >= 5) {
            break;
          }
        }

        setSuggestions(merged.slice(0, 5));
      } catch (err) {
        if (!cancelled) {
          setSuggestions(
            filterMatchingTerms(trimmedQuery, [...recentSearches, ...TRENDING_SEARCH_TERMS]),
          );
          if (__DEV__) {
            console.warn(getErrorMessage(err, 'Failed to load search suggestions'));
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, SEARCH_SUGGESTION_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, recentSearches]);

  return {
    suggestions,
    isLoading,
  };
}
