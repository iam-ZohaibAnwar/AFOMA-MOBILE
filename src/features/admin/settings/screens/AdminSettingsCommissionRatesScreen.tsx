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
import {
  ADMIN_COMMISSION_RATE_SETTING_TYPES,
  getAdminCommissionRateSettingLabel,
} from '../utils/adminSettingsContent';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsCommissionRates'>;

const RETURN_TO = authReturnTo.adminSettingsCommissionRates();

export function AdminSettingsCommissionRatesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.screen, { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }]}>
      <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
        Set commission percentages (0–9%)
      </AppText>

      <AppCard variant="muted" style={styles.card}>
        {ADMIN_COMMISSION_RATE_SETTING_TYPES.map((rateType, index) => (
          <AdminSettingsHubRow
            key={rateType}
            title={getAdminCommissionRateSettingLabel(rateType)}
            onPress={() => navigation.navigate('AdminSettingsCommissionRate', { rateType })}
            showDivider={index < ADMIN_COMMISSION_RATE_SETTING_TYPES.length - 1}
          />
        ))}
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
