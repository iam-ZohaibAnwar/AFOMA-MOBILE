import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerCouponCard } from '../components/SellerCouponCard';
import { useSellerCoupons } from '../hooks/useSellerCoupons';
import type { SellerCoupon } from '../types/sellerCoupon';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerCoupons'>;

const COUPONS_RETURN_TO = authReturnTo.sellerCoupons();

export function SellerCouponsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);
  const { isAuthorized } = useRequireSeller(COUPONS_RETURN_TO);
  const [notice, setNotice] = useState<string | null>(route.params?.notice ?? null);
  const {
    coupons,
    totalCoupons,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    deleteError,
    deletingCouponId,
    refresh,
    loadMore,
    removeCoupon,
    clearDeleteError,
  } = useSellerCoupons(isAuthorized ? userId : undefined);

  useEffect(() => {
    if (route.params?.notice) {
      setNotice(route.params.notice);
      navigation.setParams({ notice: undefined });
    }
  }, [navigation, route.params?.notice]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && userId) {
        void refresh();
      }
    }, [isAuthorized, refresh, userId]),
  );

  const handlePressEdit = useCallback(
    (couponId: string) => {
      navigation.navigate('SellerCouponForm', { couponId });
    },
    [navigation],
  );

  const handleAddCoupon = useCallback(() => {
    navigation.navigate('SellerCouponForm', {});
  }, [navigation]);

  const handleDeleteCoupon = useCallback(
    async (coupon: SellerCoupon) => {
      const couponId = coupon._id;
      if (!couponId) {
        return;
      }

      const deleted = await removeCoupon(couponId);
      if (deleted) {
        setNotice('Coupon deleted successfully!');
      }
    },
    [removeCoupon],
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof coupons)[number] }) => (
      <SellerCouponCard
        coupon={item}
        onEdit={handlePressEdit}
        onDelete={handleDeleteCoupon}
        isDeleting={deletingCouponId === item._id}
      />
    ),
    [deletingCouponId, handleDeleteCoupon, handlePressEdit],
  );

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && coupons.length === 0 && !error) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupons...
        </AppText>
      </View>
    );
  }

  if (error && coupons.length === 0 && totalCoupons === 0) {
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
          All coupons
        </AppText>
        <AppButton label="Add coupon" size="md" onPress={handleAddCoupon} />
      </View>

      {notice ? (
        <AppCard variant="flat" style={styles.successBanner}>
          <AppText variant="bodySmall" color="success">
            {notice}
          </AppText>
        </AppCard>
      ) : null}

      {deleteError ? (
        <ErrorState
          message={deleteError}
          onAction={clearDeleteError}
          actionLabel="Dismiss"
          style={styles.inlineError}
        />
      ) : null}

      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      {totalCoupons > 0 ? (
        <AppText variant="bodySmall" color="textSecondary">
          {totalCoupons} coupon{totalCoupons === 1 ? '' : 's'}
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
          title="No coupons added"
          message="Create a coupon to offer discounts to your customers."
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
      onEndReached={() => loadMore()}
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
    gap: spacing.md,
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
