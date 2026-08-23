import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminReviewStatusBadge } from '../components/AdminReviewStatusBadge';
import { AdminReviewStatusSheet } from '../components/AdminReviewStatusSheet';
import { useAdminReviewModeration } from '../hooks/useAdminReviewModeration';
import { useAdminReviewDetail } from '../hooks/useAdminReviews';
import type { AdminReviewStatus } from '../types/adminReviews';
import {
  formatAdminReviewStatus,
  getAdminReviewCustomerName,
  getAdminReviewProductName,
  getAdminReviewTitle,
} from '../utils/adminReviewsContent';
import { getAdminReviewCustomerEmail, getAdminReviewText } from '../utils/adminReviewsDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminReviewDetail'>;

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

export function AdminReviewDetailScreen({ route }: Props) {
  const { reviewId, initialReview } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminReviewDetail(reviewId);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);

  const { review, isLoading, error, reload, applyReviewUpdate } = useAdminReviewDetail({
    reviewId,
    initialReview,
    enabled: isAuthorized,
  });

  const { isUpdating, error: moderationError, updateStatus, clearError } = useAdminReviewModeration(
    isAuthorized ? reviewId : undefined,
  );

  const handleApplyStatus = useCallback(
    async (nextStatus: AdminReviewStatus) => {
      const updated = await updateStatus(nextStatus);
      if (!updated) {
        return;
      }

      applyReviewUpdate(updated);
      setStatusSheetVisible(false);
    },
    [applyReviewUpdate, updateStatus],
  );

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !review && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading review…
        </AppText>
      </View>
    );
  }

  if (error && !review) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  const customerEmail = review ? getAdminReviewCustomerEmail(review) : undefined;

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} /> : null}

        <AppCard variant="flat">
          <AppText variant="bodyMedium" style={styles.sectionTitle}>
            Customer review
          </AppText>

          <DetailField label="Customer" value={review ? getAdminReviewCustomerName(review) : '—'} />
          {customerEmail ? <DetailField label="Email" value={customerEmail} /> : null}
          <DetailField label="Product" value={review ? getAdminReviewProductName(review) : '—'} />
          <DetailField label="Review title" value={review ? getAdminReviewTitle(review) : '—'} />

          <View style={styles.statusRow}>
            <View style={styles.statusCopy}>
              <AppText variant="caption" color="textSecondary">
                Status
              </AppText>
              {review ? <AdminReviewStatusBadge status={review.reviewStatus} /> : null}
            </View>
            <AppButton
              label="Change status"
              variant="outline"
              onPress={() => {
                clearError();
                setStatusSheetVisible(true);
              }}
              disabled={!review || isUpdating}
            />
          </View>
        </AppCard>

        <AppCard variant="flat">
          <AppText variant="caption" color="textSecondary">
            Review
          </AppText>
          <AppText variant="bodyMedium" style={styles.reviewText}>
            {review ? getAdminReviewText(review) : '—'}
          </AppText>
        </AppCard>
      </ScrollView>

      <AdminReviewStatusSheet
        visible={statusSheetVisible}
        currentStatus={review ? formatAdminReviewStatus(review.reviewStatus) : 'Pending'}
        isUpdating={isUpdating}
        error={moderationError}
        onDismiss={() => setStatusSheetVisible(false)}
        onApply={(nextStatus) => {
          void handleApplyStatus(nextStatus);
        }}
        onClearError={clearError}
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
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  statusCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  reviewText: {
    color: colors.textPrimary,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  inlineError: {
    marginBottom: 0,
  },
});
