import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminSettingsHubRow } from '../components/AdminSettingsHubRow';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsHub'>;

const RETURN_TO = authReturnTo.adminSettingsHub();

export function AdminSettingsHubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.screen, { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }]}>
      <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
        Marketplace configuration
      </AppText>

      <AppCard variant="muted" style={styles.card}>
        <AdminSettingsHubRow
          title="Commission Rates"
          description="Affiliate, seller referral, and buyer referral percentages"
          onPress={() => navigation.navigate('AdminSettingsCommissionRates')}
        />
        <AdminSettingsHubRow
          title="Featured Shops"
          description="Shops shown in the marketplace spotlight"
          onPress={() => navigation.navigate('AdminSettingsFeaturedShops')}
        />
        <AdminSettingsHubRow
          title="Shipping Matrix"
          description="Tier-based origin→destination shipping surcharges"
          onPress={() => navigation.navigate('AdminSettingsShippingConfig')}
        />
        <AdminSettingsHubRow
          title="CSV Export"
          description="Download customers, sellers, affiliates, and more"
          onPress={() => navigation.navigate('AdminSettingsCsvExport')}
        />
        <AdminSettingsHubRow
          title="Seller Shipping Config"
          description="View and edit per-seller domestic and international shipping"
          onPress={() => navigation.navigate('AdminSettingsSellerShippingList')}
          showDivider={false}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  lead: {
    marginBottom: spacing.xs,
  },
  card: {
    paddingHorizontal: spacing.lg,
  },
});
