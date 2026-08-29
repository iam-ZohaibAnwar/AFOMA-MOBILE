import { useCallback, useLayoutEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { colors, spacing } from '../../../../design-system';
import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerApprovalControl } from '../components/AdminSellerApprovalControl';
import { AdminSellerBasicInfoReadOnly } from '../components/AdminSellerBasicInfoReadOnly';
import { useAdminSellerApproval } from '../hooks/useAdminSellerApproval';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';
import type { AdminSellerApprovalChoice } from '../types/adminSellerManagement';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerBasicInformation'>;

export function AdminSellerBasicInformationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerBasicInformation(sellerId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);

  const { seller, isRefreshing, error, refresh, syncSessionPatch, applySellerUpdate } =
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit basic information"
          onPress={handleEditPress}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [handleEditPress, navigation]);

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
        <View style={styles.cards}>
          <AdminProductDetailCardShell title="Approval Status" icon="shield-checkmark-outline" accent iconVariant="solid">
            <AdminSellerApprovalControl
              value={displaySeller.status}
              isUpdating={isApprovalUpdating}
              error={approvalError}
              onChange={(nextStatus) => {
                void handleApprovalChange(nextStatus);
              }}
            />
          </AdminProductDetailCardShell>

          <AdminProductDetailCardShell title="Basic Information" icon="person-outline" iconVariant="solid">
            <AdminSellerBasicInfoReadOnly seller={displaySeller} />
          </AdminProductDetailCardShell>

          {error ? (
            <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
          ) : null}
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
    gap: spacing.md,
  },
  cards: {
    gap: spacing.md,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  headerAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
