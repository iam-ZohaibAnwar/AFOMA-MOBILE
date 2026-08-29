import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerEarningDetailAmountsCard } from '../components/detail/SellerEarningDetailAmountsCard';
import { SellerEarningDetailHero } from '../components/detail/SellerEarningDetailHero';
import { SellerEarningDetailLineItemsCard } from '../components/detail/SellerEarningDetailLineItemsCard';
import { useSellerEarningDetail } from '../hooks/useSellerEarningDetail';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerEarningDetail'>;

export function SellerEarningDetailScreen({ route }: Props) {
  const { commissionId, initialRecord } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.sellerEarningDetail(commissionId, initialRecord);
  const { isAuthorized } = useRequireSeller(returnTo);

  const { record, isRefreshing, error, refresh } = useSellerEarningDetail({
    commissionId,
    initialRecord,
    enabled: isAuthorized,
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
          Earning details are unavailable.
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

      <SellerEarningDetailHero record={record} />
      <SellerEarningDetailAmountsCard record={record} />
      <SellerEarningDetailLineItemsCard record={record} />
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
