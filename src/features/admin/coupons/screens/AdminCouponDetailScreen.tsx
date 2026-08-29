import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { getErrorMessage } from '../../../../services/api/errors';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useAuth } from '../../../auth/hooks/useAuth';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import {
  AdminProductCardActionsMenu,
  type AdminProductCardActionId,
} from '../../product-management/components/AdminProductCardActionsMenu';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { deleteAdminCoupon, notifyAdminCouponUsers } from '../api/adminCouponsApi';
import { AdminCouponDetailHero } from '../components/detail/AdminCouponDetailHero';
import { AdminCouponDetailInfoCard } from '../components/detail/AdminCouponDetailInfoCard';
import { AdminCouponDetailOperationsCard } from '../components/detail/AdminCouponDetailOperationsCard';
import { useAdminCouponDetail } from '../hooks/useAdminCoupons';
import { navigateToAdminCouponForm } from '../navigation/adminCouponsNavigation';
import { buildAdminCouponDetailMenuActions } from '../utils/adminCouponCardActions';
import { getAdminCouponCreatedById } from '../utils/adminCouponsContent';
import { isAdminCouponExpired } from '../utils/adminCouponsDisplay';
import { getAdminCouponMenuTitle } from '../utils/adminCouponListDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCouponDetail'>;

export function AdminCouponDetailScreen({ navigation, route }: Props) {
  const { couponId, initialCoupon } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminCouponDetail(couponId);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const { user } = useAuth();
  const adminUserId = resolveAuthUserId(user);
  const [menuVisible, setMenuVisible] = useState(false);

  const listTab =
    initialCoupon && adminUserId && getAdminCouponCreatedById(initialCoupon) !== adminUserId
      ? 'seller'
      : 'admin';

  const { coupon, isLoading, isRefreshing, error, reload } = useAdminCouponDetail({
    couponId,
    initialCoupon,
    enabled: isAuthorized,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const displayCoupon = coupon ?? initialCoupon;

  const menuActions = useMemo(
    () => (displayCoupon ? buildAdminCouponDetailMenuActions(displayCoupon) : []),
    [displayCoupon],
  );

  const handleEdit = useCallback(() => {
    if (!couponId) {
      return;
    }

    navigateToAdminCouponForm(navigation, {
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
      await deleteAdminCoupon(couponId);
      navigation.navigate('AdminCoupons', { notice: 'Coupon deleted successfully.' });
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

  const handleNotifyPress = useCallback(() => {
    if (!couponId || isNotifying) {
      return;
    }

    Alert.alert(
      'Notify users',
      `Send a marketplace notification for ${displayCoupon?.couponCode || 'this coupon'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Notify',
          onPress: () => {
            setIsNotifying(true);
            setActionError(null);

            void notifyAdminCouponUsers(couponId)
              .then(() => {
                Alert.alert('Notification sent', 'Coupon notification was sent successfully.');
              })
              .catch((err) => {
                setActionError(getErrorMessage(err, 'Failed to send coupon notification'));
              })
              .finally(() => {
                setIsNotifying(false);
              });
          },
        },
      ],
    );
  }, [displayCoupon?.couponCode, couponId, isNotifying]);

  const handleMenuSelect = useCallback(
    (actionId: AdminProductCardActionId) => {
      setMenuVisible(false);

      switch (actionId) {
        case 'edit':
          handleEdit();
          break;
        case 'preview':
          handleNotifyPress();
          break;
        case 'delete':
          handleDeletePress();
          break;
        default:
          break;
      }
    },
    [handleDeletePress, handleEdit, handleNotifyPress],
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

  const notifyDisabled = isAdminCouponExpired(displayCoupon.expirationDate);

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

        <AdminCouponDetailHero coupon={displayCoupon} listTab={listTab} />
        <AdminCouponDetailInfoCard coupon={displayCoupon} showCreator={listTab === 'seller'} />
        <AdminCouponDetailOperationsCard
          isDeleting={isDeleting}
          isNotifying={isNotifying}
          notifyDisabled={notifyDisabled}
          onEditPress={handleEdit}
          onNotifyPress={handleNotifyPress}
          onDeletePress={handleDeletePress}
        />
      </ScrollView>

      <AdminProductCardActionsMenu
        visible={menuVisible}
        productName={getAdminCouponMenuTitle(displayCoupon)}
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
