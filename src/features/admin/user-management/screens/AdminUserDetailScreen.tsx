import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminUserDetailHeader } from '../components/detail/AdminUserDetailHeader';
import {
  AdminUserDetailFieldList,
  AdminUserDetailSection,
} from '../components/detail/AdminUserDetailPrimitives';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import {
  getAdminUserAccountFields,
  getAdminUserAddressFields,
  getAdminUserPermissionsFields,
  getAdminUserWeb3Fields,
  hasAdminUserAddress,
  hasAdminUserWeb3,
} from '../utils/adminUserDetailDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserDetail'>;

export function AdminUserDetailScreen({ navigation, route }: Props) {
  const { userId, initialUser } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminUserDetail(userId, initialUser);
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(returnTo);
  const { user, isLoading, isRefreshing, error, isNotFound, refresh } = useAdminUserDetail(
    isAuthorized ? userId : undefined,
    initialUser,
  );

  const displayUser = user ?? initialUser;

  const accountFields = useMemo(
    () => (displayUser ? getAdminUserAccountFields(displayUser) : []),
    [displayUser],
  );
  const permissionsFields = useMemo(
    () => (displayUser ? getAdminUserPermissionsFields(displayUser) : null),
    [displayUser],
  );
  const addressFields = useMemo(
    () => (displayUser ? getAdminUserAddressFields(displayUser) : []),
    [displayUser],
  );
  const web3Fields = useMemo(
    () => (displayUser ? getAdminUserWeb3Fields(displayUser) : []),
    [displayUser],
  );
  const showAddress = Boolean(displayUser && hasAdminUserAddress(displayUser));
  const showWeb3 = Boolean(displayUser && hasAdminUserWeb3(displayUser));

  const handleEditPress = useCallback(() => {
    if (!displayUser?._id) {
      return;
    }

    navigation.navigate('AdminUserForm', {
      userId: displayUser._id,
      mode: 'edit',
      initialUser: displayUser,
    });
  }, [displayUser, navigation]);

  if (isGateLoading || !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !displayUser) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading user...
        </AppText>
      </View>
    );
  }

  if ((error && !displayUser) || isNotFound) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <ErrorState
          message={error ?? 'User not found.'}
          actionLabel="Retry"
          onAction={() => void refresh()}
        />
      </View>
    );
  }

  if (!displayUser) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
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
      <AdminUserDetailHeader
        user={displayUser}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={error ? () => void refresh() : undefined}
        onEditPress={handleEditPress}
      />

      {error ? (
        <ErrorState
          message={error}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.inlineError}
        />
      ) : null}

      <AdminUserDetailSection title="Account">
        <AdminUserDetailFieldList fields={accountFields} />
      </AdminUserDetailSection>

      {permissionsFields ? (
        <AdminUserDetailSection title="Permissions">
          <AdminUserDetailFieldList fields={permissionsFields} />
        </AdminUserDetailSection>
      ) : null}

      {showAddress ? (
        <AdminUserDetailSection title="Address">
          <AdminUserDetailFieldList fields={addressFields} />
        </AdminUserDetailSection>
      ) : null}

      {showWeb3 ? (
        <AdminUserDetailSection title="Web3">
          <AdminUserDetailFieldList fields={web3Fields} />
        </AdminUserDetailSection>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  inlineError: {
    marginTop: 0,
  },
});
