import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { ReferralEarningRow } from '../components/ReferralEarningRow';
import { useReferralEarnings } from '../hooks/useReferralEarnings';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ReferralEarnings'>;

const REFERRAL_EARNINGS_RETURN_TO = authReturnTo.referralEarnings();

export function ReferralEarningsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { isAuthorized } = useRequireAuth(REFERRAL_EARNINGS_RETURN_TO);
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);

  const {
    paginatedCommissions,
    totalEarnings,
    currentPage,
    totalPages,
    isLoading,
    error,
    retry,
    goToPreviousPage,
    goToNextPage,
    canGoPrevious,
    canGoNext,
  } = useReferralEarnings(isAuthorized ? userId : undefined);

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading earnings...
        </AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void retry()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
      onScroll={onMarketplaceScroll}
      {...marketplaceScrollProps}
    >
      <AppCard variant="muted">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          My Earnings
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.sectionCopy}>
          Referral commissions from eligible orders placed by customers you referred.
        </AppText>

        {totalEarnings > 0 ? (
          <AppText variant="bodyMedium" style={styles.countLabel}>
            {totalEarnings} earnings
          </AppText>
        ) : null}

        {paginatedCommissions.length > 0 ? (
          <View style={styles.list}>
            {paginatedCommissions.map((record) => (
              <ReferralEarningRow key={record._id ?? `${record.orderId?._id}-row`} record={record} />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Earnings Yet"
            message="Discover unique handicrafts at the best deals."
            style={styles.emptyState}
          />
        )}
      </AppCard>

      {totalEarnings > 0 ? (
        <View style={styles.pagination}>
          <Pressable
            accessibilityRole="button"
            onPress={goToPreviousPage}
            disabled={!canGoPrevious}
            style={[styles.paginationButton, !canGoPrevious && styles.paginationButtonDisabled]}
          >
            <AppText variant="bodySmall" color={canGoPrevious ? 'textLink' : 'textMuted'}>
              Previous
            </AppText>
          </Pressable>

          <AppText variant="bodySmall" color="textSecondary">
            Page {currentPage} of {totalPages}
          </AppText>

          <Pressable
            accessibilityRole="button"
            onPress={goToNextPage}
            disabled={!canGoNext}
            style={[styles.paginationButton, !canGoNext && styles.paginationButtonDisabled]}
          >
            <AppText variant="bodySmall" color={canGoNext ? 'textLink' : 'textMuted'}>
              Next
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  sectionCopy: {
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  countLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  emptyState: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  paginationButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
});
