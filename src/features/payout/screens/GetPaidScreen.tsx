import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { RootStackParamList } from '../../../app/navigation/types';
import { useGetPaidCommission } from '../hooks/useGetPaidCommission';
import {
  buildProfileCountryHint,
  getGetPaidStatusMessage,
  resolveGetPaidUiState,
} from '../utils/getPaidState';
import { parseGetPaidCommissionId } from '../utils/parseGetPaidLink';

type Props = NativeStackScreenProps<RootStackParamList, 'GetPaid'>;

export function GetPaidScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const commissionId = parseGetPaidCommissionId(route.params);
  const { commission, isLoading, error, reload } = useGetPaidCommission(commissionId);

  const uiState = resolveGetPaidUiState(commissionId, commission, isLoading, error);
  const statusMessage = getGetPaidStatusMessage(uiState, error);
  const profileHint = commission ? buildProfileCountryHint(commission) : null;

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Shopping', {
      screen: 'MainTabs',
      params: { screen: 'MarketplaceTab' },
    });
  };

  const renderBody = () => {
    if (uiState === 'loading') {
      return (
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading payout details...
          </AppText>
        </View>
      );
    }

    if (uiState === 'missing_token' || uiState === 'paid' || uiState === 'in_process' || uiState === 'in_process_submitted') {
      return (
        <View style={styles.statusContent}>
          <AppText variant="h2" style={styles.statusTitle}>
            {statusMessage.title}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.statusBody}>
            {statusMessage.body}
          </AppText>
        </View>
      );
    }

    if (uiState === 'contact_support') {
      return (
        <View style={styles.statusContent}>
          <AppText variant="h2" style={styles.statusTitle}>
            {statusMessage.title}
          </AppText>
          <ErrorState message={error ?? statusMessage.body} onAction={() => void reload()} />
        </View>
      );
    }

    return (
      <View style={styles.actionableContent}>
        <AppText variant="h3" style={styles.actionableTitle}>
          Get paid (Korapay)
        </AppText>
        <AppText variant="body" color="textSecondary">
          Choose bank or mobile money, pick your currency corridor, verify your destination, then
          submit.
        </AppText>

        {profileHint ? (
          <AppCard variant="flat">
            <AppText variant="bodySmall" color="textSecondary">
              {profileHint}
            </AppText>
          </AppCard>
        ) : null}

        <AppCard variant="muted">
          <AppText variant="bodyMedium" style={styles.readyLabel}>
            Payout link verified
          </AppText>
          <AppText variant="bodySmall" color="textSecondary">
            Status: {commission?.payoutStatus ?? 'Pending'}
          </AppText>
          <AppText variant="caption" color="textMuted" style={styles.phaseNote}>
            Payout method selection will appear here next.
          </AppText>
        </AppCard>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={handleClose} style={styles.closeButton}>
          <AppText variant="bodyMedium" color="textLink">
            Close
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  statusContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  statusTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statusBody: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
  },
  actionableContent: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  actionableTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  readyLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  phaseNote: {
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
