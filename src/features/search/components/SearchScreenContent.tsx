import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FadeInContent } from '../../../components/motion';
import { AppText } from '../../../components/ui/AppText';
import { TRENDING_SEARCH_TERMS } from '../../../constants/searchDefaults';
import { colors, spacing } from '../../../design-system';
import { ProductGrid } from '../../products/components/ProductGrid';
import { SuggestedProductsSection } from '../../products/components/SuggestedProductsSection';
import { useProductSearch } from '../hooks/useProductSearch';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { SearchHeader } from './SearchHeader';
import { SearchRecentSection } from './SearchRecentSection';
import { SearchSuggestionsSection } from './SearchSuggestionsSection';
import { SearchTrendingSection } from './SearchTrendingSection';
import type { Product } from '../../../services/types/product';

export interface SearchScreenContentProps {
  initialQuery?: string;
  onProductPress: (product: Product) => void;
  contentStyle?: StyleProp<ViewStyle>;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function SearchScreenContent({
  initialQuery = '',
  onProductPress,
  contentStyle,
  showBackButton = false,
  onBackPress,
}: SearchScreenContentProps) {
  const [searchText, setSearchText] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery.trim());
  const { recentSearches, saveSearch, removeSearch, clearAll } = useRecentSearches();
  const { suggestions } = useSearchSuggestions(searchText, recentSearches);
  const {
    products,
    suggestedProducts,
    isRefreshing,
    error,
    hasSearched,
    retry,
  } = useProductSearch(submittedQuery);

  useEffect(() => {
    setSearchText(initialQuery);
    setSubmittedQuery(initialQuery.trim());
  }, [initialQuery]);

  const showResults = hasSearched && submittedQuery.length > 0;
  const showSuggestions = searchText.trim().length > 0 && !showResults;
  const showBlockingError = Boolean(error) && products.length === 0 && !isRefreshing;

  const commitSearch = useCallback(
    async (term: string) => {
      const normalized = term.trim();
      setSearchText(normalized);
      setSubmittedQuery(normalized);

      if (normalized) {
        await saveSearch(normalized);
      }
    },
    [saveSearch],
  );

  const handleSubmitSearch = () => {
    void commitSearch(searchText);
  };

  const handleClearInput = () => {
    setSearchText('');
    setSubmittedQuery('');
  };

  const handleSelectTerm = (term: string) => {
    void commitSearch(term);
  };

  const handleRemoveRecent = (term: string) => {
    void removeSearch(term);
  };

  const handleClearRecent = () => {
    void clearAll();
  };

  const emptyMessage = submittedQuery
    ? `No products matched "${submittedQuery}".`
    : 'Enter a search term to find products.';

  return (
    <View style={[styles.container, contentStyle]}>
      <SearchHeader
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          if (submittedQuery && text.trim() !== submittedQuery) {
            setSubmittedQuery('');
          }
        }}
        onSubmit={handleSubmitSearch}
        onClear={handleClearInput}
        showBackButton={showBackButton}
        onBackPress={onBackPress}
      />

      {showResults ? (
        <>
          <View style={styles.resultsHeader}>
            <AppText variant="h3">Results for &quot;{submittedQuery}&quot;</AppText>
            {!isRefreshing && !showBlockingError ? (
              <AppText variant="bodySmall" color="textMuted">
                {products.length} {products.length === 1 ? 'result' : 'results'}
              </AppText>
            ) : null}
          </View>

          {error && !showBlockingError ? (
            <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
              <AppText variant="bodySmall" color="error">
                {error}
              </AppText>
              <AppText variant="bodySmall" style={styles.refreshBannerAction}>
                Retry
              </AppText>
            </Pressable>
          ) : null}

          {showBlockingError ? (
            <View style={styles.stateBox}>
              <AppText variant="bodySmall" color="error">
                {error}
              </AppText>
              <Pressable style={styles.retryButton} onPress={() => void retry()}>
                <AppText variant="bodyMedium" color="textInverse">
                  Try again
                </AppText>
              </Pressable>
            </View>
          ) : (
            <FadeInContent style={styles.resultsContent}>
              <ProductGrid
                products={products}
                onProductPress={onProductPress}
                isLoading={isRefreshing && products.length === 0}
                emptyMessage={emptyMessage}
                ListFooterComponent={
                  <SuggestedProductsSection
                    title="More like this"
                    products={suggestedProducts}
                    onProductPress={onProductPress}
                  />
                }
              />
            </FadeInContent>
          )}
        </>
      ) : (
        <ScrollView
          style={styles.discoveryScroll}
          contentContainerStyle={styles.discoveryContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showSuggestions ? (
            <SearchSuggestionsSection suggestions={suggestions} onSelect={handleSelectTerm} />
          ) : null}

          <SearchRecentSection
            recentSearches={recentSearches}
            onSelect={handleSelectTerm}
            onRemove={handleRemoveRecent}
            onClearAll={handleClearRecent}
          />

          <SearchTrendingSection terms={TRENDING_SEARCH_TERMS} onSelect={handleSelectTerm} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  discoveryScroll: {
    flex: 1,
  },
  discoveryContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  resultsContent: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
