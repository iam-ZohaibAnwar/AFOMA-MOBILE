import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';
import { AdminSectionTitle } from './AdminSectionTitle';
import type {
  AdminDashboardLatestTab,
  AdminLatestProduct,
  AdminLatestSeller,
  AdminPopularSearchTerm,
} from '../types/adminDashboard';
import {
  formatAdminCount,
  formatAdminProductPrice,
  formatAdminSearchKeyword,
  formatAdminSellerName,
} from '../utils/adminDashboardDisplay';

const TABS: Array<{ key: AdminDashboardLatestTab; label: string }> = [
  { key: 'products', label: 'Products' },
  { key: 'sellers', label: 'Sellers' },
  { key: 'searches', label: 'Searches' },
];

export interface AdminDashboardLatestTabsProps {
  latestProducts: AdminLatestProduct[];
  latestSellers: AdminLatestSeller[];
  searchTerms: AdminPopularSearchTerm[];
  errors: {
    latestProducts?: string;
    latestSellers?: string;
    searchTerms?: string;
  };
  onRetry?: () => void;
}

export function AdminDashboardLatestTabs({
  latestProducts,
  latestSellers,
  searchTerms,
  errors,
  onRetry,
}: AdminDashboardLatestTabsProps) {
  const [activeTab, setActiveTab] = useState<AdminDashboardLatestTab>('products');

  const activeError =
    activeTab === 'products'
      ? errors.latestProducts
      : activeTab === 'sellers'
        ? errors.latestSellers
        : errors.searchTerms;

  return (
    <View style={styles.section}>
      <AdminSectionTitle title="Latest activity" showIcon={false} />

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
            >
              <AppText
                variant="bodySmall"
                color={isActive ? 'textInverse' : 'textSecondary'}
                style={styles.tabLabel}
              >
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <AppCard variant="flat" style={styles.panel}>
        {activeError ? (
          <ErrorState message={activeError} onAction={onRetry} style={styles.error} />
        ) : null}

        {activeTab === 'products' ? (
          latestProducts.length > 0 ? (
            <View style={styles.list}>
              {latestProducts.map((product, index) => (
                <View key={`${product.productName ?? 'product'}-${index}`} style={styles.item}>
                  <AppText variant="bodyMedium" style={styles.itemTitle}>
                    {product.productName ?? '—'}
                  </AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {product.productType ?? '—'} · {formatAdminProductPrice(product)}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="No products yet" style={styles.empty} />
          )
        ) : null}

        {activeTab === 'sellers' ? (
          latestSellers.length > 0 ? (
            <View style={styles.list}>
              {latestSellers.map((seller, index) => (
                <View key={seller._id ?? seller.uuid ?? `seller-${index}`} style={styles.item}>
                  <AppText variant="bodyMedium" style={styles.itemTitle}>
                    {formatAdminSellerName(seller)}
                  </AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {seller.uuid ?? '—'} · {seller.email ?? '—'}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {[seller.country, seller.state].filter(Boolean).join(', ') || '—'}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="No sellers yet" style={styles.empty} />
          )
        ) : null}

        {activeTab === 'searches' ? (
          searchTerms.length > 0 ? (
            <View style={styles.list}>
              {searchTerms.map((term, index) => (
                <View key={`${term._id ?? 'term'}-${index}`} style={styles.searchRow}>
                  <AppText variant="bodyMedium" style={styles.itemTitle}>
                    {formatAdminSearchKeyword(term)}
                  </AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {formatAdminCount(term.count)}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState title="No search terms yet" style={styles.empty} />
          )
        ) : null}
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  panel: {
    backgroundColor: adminDashboardTheme.cardBackground,
    borderRadius: adminDashboardTheme.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: adminDashboardTheme.cardBorder,
    ...adminDashboardTheme.cardShadow,
  },
  tabRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tabChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: adminDashboardTheme.cardBorder,
    backgroundColor: colors.background,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontWeight: '600',
  },
  list: {
    gap: spacing.md,
  },
  item: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  error: {
    marginHorizontal: 0,
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  empty: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
