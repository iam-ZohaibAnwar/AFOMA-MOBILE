import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerApprovalControl } from '../components/AdminSellerApprovalControl';
import { AdminSellerBasicInfoReadOnly } from '../components/AdminSellerBasicInfoReadOnly';
import { useAdminSellerApproval } from '../hooks/useAdminSellerApproval';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';
import type { AdminSellerApprovalChoice } from '../types/adminSellerManagement';
import { getAdminSellerDisplayName } from '../utils/adminSellerDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerBasicInformation'>;

export function AdminSellerBasicInformationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerBasicInformation(sellerId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const { seller, isLoading, isRefreshing, error, refresh, syncSessionPatch, applySellerUpdate } =
    useAdminSellerDetail(isAuthorized ? sellerId : undefined, initialSeller);

  const {
    isUpdating: isApprovalUpdating,
    error: approvalError,
    changeApprovalStatus,
    clearError: clearApprovalError,
  } = useAdminSellerApproval(isAuthorized ? sellerId : undefined);

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displaySeller = seller ?? initialSeller;

  const handleApprovalChange = useCallback(
    async (nextStatus: AdminSellerApprovalChoice) => {
      clearApprovalError();
      const patch = await changeApprovalStatus(nextStatus, displaySeller?.status);
      if (patch) {
        applySellerUpdate(patch);
      }
    },
    [applySellerUpdate, changeApprovalStatus, clearApprovalError, displaySeller?.status],
  );

  const handleEditPress = useCallback(() => {
    if (!displaySeller) {
      return;
    }

    navigation.navigate('AdminSellerBasicInformationEdit', {
      sellerId,
      initialSeller: displaySeller,
    });
  }, [displaySeller, navigation, sellerId]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
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
    >
      {error && !displaySeller ? (
        <ErrorState message={error} onAction={() => void refresh()} />
      ) : null}

      {displaySeller ? (
        <>
          <AppCard style={styles.headerCard}>
            <AppText variant="h3">{getAdminSellerDisplayName(displaySeller)}</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {displaySeller.email ?? 'No email'}
            </AppText>
            {isLoading ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption" color="textSecondary">
                  Refreshing seller details...
                </AppText>
              </View>
            ) : null}
            {error ? (
              <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
            ) : null}
          </AppCard>

          <AppCard>
            <AdminSellerApprovalControl
              value={displaySeller.status}
              isUpdating={isApprovalUpdating}
              error={approvalError}
              onChange={(nextStatus) => {
                void handleApprovalChange(nextStatus);
              }}
            />
          </AppCard>

          <AppCard>
            <View style={styles.sectionHeader}>
              <AppText variant="label">Basic information</AppText>
              <AppButton label="Edit" variant="outline" onPress={handleEditPress} />
            </View>
            <AdminSellerBasicInfoReadOnly seller={displaySeller} />
          </AppCard>
        </>
      ) : isLoading ? (
        <View style={styles.centeredLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            Loading basic information...
          </AppText>
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
  headerCard: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inlineError: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  centeredLoading: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
