import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';
import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { useCategories } from '../hooks/useCategories';
import {
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import { CategoryDiscoveryPanel } from './CategoryDiscoveryPanel';

export type CategoryMarketplaceNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'MarketplaceTab'>,
  NativeStackNavigationProp<ShoppingStackParamList>
>;

export interface CategoryMarketplaceContentProps {
  navigation: CategoryMarketplaceNavigationProp;
}

export function CategoryMarketplaceContent({ navigation }: CategoryMarketplaceContentProps) {
  const { categories, isLoading, error, retry } = useCategories();
  const navigableCategories = getNavigableCategories(categories);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const stackNavigation = navigation as unknown as NativeStackNavigationProp<ShoppingStackParamList>;

  const handleToggleExpand = useCallback((categoryId: string) => {
    setExpandedCategoryId((current) => (current === categoryId ? null : categoryId));
  }, []);

  const showBlockingError = Boolean(error) && navigableCategories.length === 0 && !isLoading;

  if (showBlockingError) {
    return (
      <View style={styles.blockingState}>
        <ErrorState message={error ?? 'Failed to load categories'} onAction={() => void retry()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      directionalLockEnabled
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      {error ? (
        <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
          <AppText variant="bodySmall" color="error">
            {error}
          </AppText>
          <AppText variant="bodySmall" style={styles.refreshBannerAction}>
            Retry
          </AppText>
        </Pressable>
      ) : null}

      {navigableCategories.length === 0 && !isLoading ? (
        <AppText variant="body" color="textMuted" style={styles.emptyText}>
          No categories available right now.
        </AppText>
      ) : null}

      {navigableCategories.map((item, index) => {
        const categoryId = getCategoryRouteId(item);
        if (!categoryId) {
          return null;
        }

        return (
          <View key={categoryId} style={[styles.panelWrap, index > 0 ? styles.panelSpacing : undefined]}>
            <CategoryDiscoveryPanel
              category={item}
              colorIndex={index}
              expanded={expandedCategoryId === categoryId}
              onToggleExpand={() => handleToggleExpand(categoryId)}
              navigation={stackNavigation}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  panelWrap: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  panelSpacing: {
    marginTop: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
  blockingState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenPaddingHorizontal,
    backgroundColor: colors.background,
  },
});
