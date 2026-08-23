import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { getErrorMessage } from '../../../../services/api/errors';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { deleteAdminCoupon } from '../api/adminCouponsApi';
import { useAdminCouponDetail } from '../hooks/useAdminCoupons';
import {
  navigateToAdminCouponForm,
} from '../navigation/adminCouponsNavigation';
import {
  formatAdminCouponDiscount,
  formatAdminCouponExpirationDate,
  formatAdminCouponType,
  formatAdminCouponUsage,
  getAdminCouponStatusLabel,
  isAdminCouponExpired,
} from '../utils/adminCouponsDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCouponDetail'>;

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.fieldValue}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminCouponDetailScreen({ navigation, route }: Props) {
  const { couponId, initialCoupon } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminCouponDetail(couponId);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { coupon, isLoading, error, reload } = useAdminCouponDetail({
    couponId,
    initialCoupon,
    enabled: isAuthorized,
  });

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
    setDeleteError(null);

    try {
      await deleteAdminCoupon(couponId);
      navigation.navigate('AdminCoupons', { notice: 'Coupon deleted successfully!' });
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete coupon'));
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
      `Are you sure you want to delete ${coupon?.couponCode || 'this coupon'}?`,
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
  }, [coupon?.couponCode, isDeleting, performDelete]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !coupon && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading coupon…
        </AppText>
      </View>
    );
  }

  if (error && !coupon) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  const isExpired = isAdminCouponExpired(coupon?.expirationDate);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
    >
      {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} /> : null}
      {deleteError ? (
        <ErrorState message={deleteError} onAction={() => void performDelete()} style={styles.inlineError} />
      ) : null}

      <AppCard variant="flat">
        <View style={styles.summaryHeader}>
          <AppText variant="bodyMedium" style={styles.sectionTitle}>
            Coupon summary
          </AppText>
          <View style={[styles.statusBadge, isExpired ? styles.statusExpired : styles.statusActive]}>
            <AppText variant="caption" style={isExpired ? styles.statusExpiredText : styles.statusActiveText}>
              {coupon ? getAdminCouponStatusLabel(coupon) : '—'}
            </AppText>
          </View>
        </View>

        <DetailField label="Code" value={coupon?.couponCode ?? '—'} />
        <DetailField label="Type" value={formatAdminCouponType(coupon?.couponType)} />
        <DetailField label="Discount" value={coupon ? formatAdminCouponDiscount(coupon) : '—'} />
        <DetailField
          label="Minimum cart"
          value={coupon?.minimumCartAmount != null ? String(coupon.minimumCartAmount) : '—'}
        />
        <DetailField label="Expires" value={formatAdminCouponExpirationDate(coupon?.expirationDate)} />
        <DetailField label="Usage" value={coupon ? formatAdminCouponUsage(coupon) : '—'} />
        <DetailField
          label="Per customer limit"
          value={
            coupon?.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : '—'
          }
        />
      </AppCard>

      {coupon?.description ? (
        <AppCard variant="flat">
          <AppText variant="caption" color="textSecondary">
            Description
          </AppText>
          <AppText variant="bodyMedium" style={styles.description}>
            {coupon.description}
          </AppText>
        </AppCard>
      ) : null}

      <View style={styles.actions}>
        <AppButton label="Edit coupon" onPress={handleEdit} disabled={isDeleting} fullWidth />
        <AppButton
          label={isDeleting ? 'Deleting…' : 'Delete coupon'}
          variant="outline"
          onPress={handleDeletePress}
          loading={isDeleting}
          disabled={isDeleting}
          fullWidth
          labelStyle={styles.deleteLabel}
        />
      </View>
    </ScrollView>
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusActive: {
    backgroundColor: colors.successBg,
  },
  statusExpired: {
    backgroundColor: colors.errorBg,
  },
  statusActiveText: {
    color: colors.success,
    fontWeight: '600',
  },
  statusExpiredText: {
    color: colors.error,
    fontWeight: '600',
  },
  field: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldValue: {
    color: colors.textPrimary,
  },
  description: {
    color: colors.textPrimary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  inlineError: {
    marginBottom: 0,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  deleteLabel: {
    color: colors.error,
  },
});
