import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCommissionStatusSheet } from '../components/AdminCommissionStatusSheet';
import { AdminCommissionDetailAmountsCard } from '../components/detail/AdminCommissionDetailAmountsCard';
import { AdminCommissionDetailHero } from '../components/detail/AdminCommissionDetailHero';
import { AdminCommissionDetailOperationsCard } from '../components/detail/AdminCommissionDetailOperationsCard';
import { useAdminCommissionDetail } from '../hooks/useAdminCommissionDetail';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCommissionDetail'>;

export function AdminCommissionDetailScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { commissionId, displayType, initialRow } = route.params;
  const returnTo = authReturnTo.adminCommissionDetail({ commissionId, displayType, initialRow });
  const { isAuthorized } = useRequireFullAccess(returnTo);
  const [statusSheetVisible, setStatusSheetVisible] = useState(false);

  const {
    row,
    isLoading,
    isRefreshing,
    error,
    refresh,
    initiatingCommissionId,
    updatingStatusCommissionId,
    actionError,
    clearActionError,
    initiatePayout,
    updatePayoutStatus,
  } = useAdminCommissionDetail(isAuthorized, commissionId, displayType, initialRow);

  const handleInitiatePress = useCallback(() => {
    if (!row) {
      return;
    }

    clearActionError();
    Alert.alert(
      'Initiate Korapay payout?',
      `Send a payout link email for ${row.recipientName} (${row.orderDisplayId})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send link',
          onPress: () => {
            void initiatePayout();
          },
        },
      ],
    );
  }, [clearActionError, initiatePayout, row]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !row) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + spacing.lg }]}>
        <ErrorState message={error} actionLabel="Retry" onAction={() => void refresh()} />
      </View>
    );
  }

  if (!row) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <AdminCommissionDetailHero row={row} />
        <AdminCommissionDetailAmountsCard row={row} />
        <AdminCommissionDetailOperationsCard
          row={row}
          initiatingCommissionId={initiatingCommissionId}
          updatingStatusCommissionId={updatingStatusCommissionId}
          onInitiatePress={handleInitiatePress}
          onStatusPress={() => {
            clearActionError();
            setStatusSheetVisible(true);
          }}
        />

        {error ? (
          <ErrorState message={error} actionLabel="Retry" onAction={() => void refresh()} style={styles.inlineError} />
        ) : null}

        {actionError ? (
          <View style={styles.actionError}>
            <AppText variant="bodySmall" color="error">
              {actionError.message}
            </AppText>
          </View>
        ) : null}

        {isLoading && !isRefreshing ? (
          <AppText variant="caption" color="textMuted">
            Refreshing commission...
          </AppText>
        ) : null}
      </ScrollView>

      <AdminCommissionStatusSheet
        visible={statusSheetVisible}
        currentStatus={row.payoutStatus}
        isUpdating={updatingStatusCommissionId === row.commissionId}
        onClose={() => setStatusSheetVisible(false)}
        onApply={(nextStatus) => {
          void updatePayoutStatus(nextStatus).then((success) => {
            if (success) {
              setStatusSheetVisible(false);
            }
          });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    paddingHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  inlineError: {
    marginHorizontal: 0,
  },
  actionError: {
    paddingVertical: spacing.sm,
  },
});
