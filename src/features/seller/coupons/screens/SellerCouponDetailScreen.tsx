import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { getErrorMessage } from '../../../../services/api/errors';
import { AdminCouponDetailHero } from '../../../admin/coupons/components/detail/AdminCouponDetailHero';
import { AdminCouponDetailInfoCard } from '../../../admin/coupons/components/detail/AdminCouponDetailInfoCard';
import type { AdminCouponListItem } from '../../../admin/coupons/types/adminCoupons';
import {
  AdminProductCardActionsMenu,
  type AdminProductCardActionId,
} from '../../../admin/product-management/components/AdminProductCardActionsMenu';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { deleteSellerCoupon } from '../api/sellerCouponsApi';
import { SellerCouponDetailOperationsCard } from '../components/detail/SellerCouponDetailOperationsCard';
import { useSellerCouponDetail } from '../hooks/useSellerCoupons';
import { navigateToSellerCouponForm } from '../navigation/sellerCouponsNavigation';
import { buildSellerCouponDetailMenuActions } from '../utils/sellerCouponCardActions';
import { getSellerCouponMenuTitle } from '../utils/sellerCouponListDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerCouponDetail'>;

export function SellerCouponDetailScreen({ navigation, route }: Props) {
  const { couponId, initialCoupon } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.sellerCouponDetail(couponId);
  const { isAuthorized } = useRequireSeller(returnTo);
  const [menuVisible, setMenuVisible] = useState(false);

  const { coupon, isLoading, isRefreshing, error, reload } = useSellerCouponDetail({
    couponId,
    initialCoupon,
    enabled: isAuthorized,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const displayCoupon = (coupon ?? initialCoupon) as AdminCouponListItem | undefined;

  const menuActions = useMemo(() => buildSellerCouponDetailMenuActions(), []);

  const handleEdit = useCallback(() => {
    if (!couponId) {
      return;
    }

    navigateToSellerCouponForm(navigation, {
      couponId,
      initialCoupon: coupon ?? initialCoupon,
    });
  }, [coupon, couponId, initialCoupon, navigation]);

  const performDelete = useCallback(async () => {
    if (!couponId || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);

    try {
      await deleteSellerCoupon(couponId);
      navigation.navigate('SellerCoupons', { notice: 'Coupon deleted successfully.' });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Failed to delete coupon'));
    } finally {
      setIsDeleting(false);
    }
  }, [couponId, isDeleting, navigation]);

  const handleDeletePress = useCallback(() => {
    if (isDeleting) {
      return;
    }

    Alert.alert(
      'Delete coupon',
      `Are you sure you want to delete ${displayCoupon?.couponCode || 'this coupon'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ],
    );
  }, [displayCoupon?.couponCode, isDeleting, performDelete]);

  const handleMenuSelect = useCallback(
    (actionId: AdminProductCardActionId) => {
      setMenuVisible(false);

      switch (actionId) {
        case 'edit':
          handleEdit();
          break;
        case 'delete':
          handleDeletePress();
          break;
        default:
          break;
      }
    },
    [handleDeletePress, handleEdit],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Coupon Detail',
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Coupon actions"
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !displayCoupon && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupon...
        </AppText>
      </View>
    );
  }

  if (error && !displayCoupon) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  if (!displayCoupon) {
    return null;
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void reload()} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} /> : null}

        {actionError ? (
          <ErrorState
            message={actionError}
            actionLabel="Dismiss"
            onAction={() => setActionError(null)}
            style={styles.inlineError}
          />
        ) : null}

        <AdminCouponDetailHero coupon={displayCoupon} listTab="admin" />
        <AdminCouponDetailInfoCard coupon={displayCoupon} />
        <SellerCouponDetailOperationsCard
          isDeleting={isDeleting}
          onEditPress={handleEdit}
          onDeletePress={handleDeletePress}
        />
      </ScrollView>

      <AdminProductCardActionsMenu
        visible={menuVisible}
        productName={getSellerCouponMenuTitle(displayCoupon)}
        actions={menuActions}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
      />
    </>
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
  inlineError: {
    marginBottom: 0,
  },
  headerAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
