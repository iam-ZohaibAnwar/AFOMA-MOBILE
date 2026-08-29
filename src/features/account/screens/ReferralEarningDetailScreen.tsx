import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { ReferralEarningDetailAmountsCard } from '../referral-earnings/components/detail/ReferralEarningDetailAmountsCard';
import { ReferralEarningDetailHero } from '../referral-earnings/components/detail/ReferralEarningDetailHero';
import { useReferralEarningDetail } from '../referral-earnings/hooks/useReferralEarningDetail';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'ReferralEarningDetail'>;

export function ReferralEarningDetailScreen({ route }: Props) {
  const { commissionId, initialRecord } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.referralEarningDetail(commissionId, initialRecord);
  const { isAuthorized } = useRequireAuth(returnTo);
  const { user } = useAuth();
  const userId = resolveAuthUserId(user);

  const { record, isRefreshing, error, refresh } = useReferralEarningDetail({
    commissionId,
    initialRecord,
    enabled: isAuthorized && Boolean(userId),
  });

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !record) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Referral earning details are unavailable.
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {error ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
      ) : null}

      <ReferralEarningDetailHero record={record} />
      <ReferralEarningDetailAmountsCard record={record} />
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  inlineError: {
    marginHorizontal: 0,
  },
});
