import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCouponCard } from '../components/AdminCouponCard';
import { useAdminCoupons } from '../hooks/useAdminCoupons';
import type { AdminCouponListItem } from '../types/adminCoupons';
import {
  navigateToAdminCouponDetail,
  navigateToAdminCouponForm,
} from '../navigation/adminCouponsNavigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCoupons'>;

const RETURN_TO = authReturnTo.adminCoupons();

export function AdminCouponsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const adminUserId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [notice, setNotice] = useState<string | null>(route.params?.notice ?? null);

  const {
    coupons,
    totalCount,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    actionError,
    refresh,
    loadMore,
    clearActionError,
  } = useAdminCoupons({
    adminUserId: isAuthorized ? adminUserId : undefined,
    enabled: isAuthorized,
  });

  useEffect(() => {
    if (route.params?.notice) {
      setNotice(route.params.notice);
      navigation.setParams({ notice: undefined });
    }
  }, [navigation, route.params?.notice]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

  const handleAddCoupon = useCallback(() => {
    navigateToAdminCouponForm(navigation);
  }, [navigation]);

  const handlePressCoupon = useCallback(
    (coupon: AdminCouponListItem) => {
      const couponId = coupon._id;
      if (!couponId) {
        return;
      }

      navigateToAdminCouponDetail(navigation, couponId, coupon);
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: AdminCouponListItem }) => (
      <AdminCouponCard coupon={item} onPress={handlePressCoupon} />
    ),
    [handlePressCoupon],
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && coupons.length === 0 && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupons…
        </AppText>
      </View>
    );
  }

  if (error && coupons.length === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  const listHeader = (
    <View style={styles.headerContent}>
      <View style={styles.headerRow}>
        <AppText variant="bodyMedium" style={styles.title}>
          Admin coupons
        </AppText>
        <AppButton label="Add coupon" size="md" onPress={handleAddCoupon} />
      </View>

      <AppText variant="bodySmall" color="textSecondary">
        Manage promotional coupons created by your admin account.
      </AppText>

      {notice ? (
        <AppCard variant="flat" style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {notice}
          </AppText>
        </AppCard>
      ) : null}

      {actionError ? (
        <ErrorState
          message={actionError}
          onAction={clearActionError}
          actionLabel="Dismiss"
          style={styles.inlineError}
        />
      ) : null}

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {totalCount > 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          {totalCount} coupon{totalCount === 1 ? '' : 's'}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      data={coupons}
      keyExtractor={(item, index) => item._id ?? `coupon-${index}`}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <EmptyState
          title="No coupons yet"
          message="Create a coupon to offer discounts on the marketplace."
          style={styles.emptyState}
        />
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      onEndReached={() => void loadMore()}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successSoft,
  },
  inlineError: {
    marginBottom: 0,
  },
  separator: {
    height: spacing.md,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
