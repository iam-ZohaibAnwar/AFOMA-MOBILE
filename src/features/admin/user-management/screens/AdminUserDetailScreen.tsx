import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { colors, spacing } from '../../../../design-system';
import { AdminProductCardActionsMenu } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireFullAccess } from '../../hooks/useRequireFullAccess';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminUserDetailHero } from '../components/detail/AdminUserDetailHero';
import { AdminUserDetailInfoCard } from '../components/detail/AdminUserDetailInfoCard';
import { AdminUserDetailOperationsCard } from '../components/detail/AdminUserDetailOperationsCard';
import {
  AdminUserDetailFieldList,
  AdminUserDetailSection,
} from '../components/detail/AdminUserDetailPrimitives';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import { useAdminUserOperations } from '../hooks/useAdminUserOperations';
import { buildAdminUserCardActions } from '../utils/adminUserCardActions';
import {
  getAdminUserAddressFields,
  hasAdminUserAddress,
} from '../utils/adminUserDetailDisplay';
import { formatAdminUserDisplayName } from '../utils/adminUserRoleOptions';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUserDetail'>;

export function AdminUserDetailScreen({ navigation, route }: Props) {
  const { userId, initialUser } = route.params;
  const insets = useSafeAreaInsets();
  const returnTo = authReturnTo.adminUserDetail(userId, initialUser);
  const { isAuthorized, isLoading: isGateLoading } = useRequireFullAccess(returnTo);
  const [menuVisible, setMenuVisible] = useState(false);

  const { user, isLoading, isRefreshing, error, isNotFound, refresh, syncSessionPatch } =
    useAdminUserDetail(isAuthorized ? userId : undefined, initialUser);

  const { deletingUserId, deleteUser, actionError, clearActionError } = useAdminUserOperations();

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displayUser = user ?? initialUser;

  const menuActions = useMemo(() => buildAdminUserCardActions(), []);

  const addressFields = useMemo(
    () => (displayUser ? getAdminUserAddressFields(displayUser) : []),
    [displayUser],
  );
  const showAddress = Boolean(displayUser && hasAdminUserAddress(displayUser));

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

  const handleDeletePress = useCallback(() => {
    if (!displayUser?._id) {
      return;
    }

    Alert.alert(
      'Delete user?',
      `This will permanently remove ${formatAdminUserDisplayName(displayUser)}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearActionError();
            void (async () => {
              const deleted = await deleteUser(displayUser._id!);
              if (deleted) {
                navigation.goBack();
              }
            })();
          },
        },
      ],
    );
  }, [clearActionError, deleteUser, displayUser, navigation]);

  const handleMenuSelect = useCallback(
    (actionId: AdminProductCardActionId) => {
      setMenuVisible(false);

      switch (actionId) {
        case 'edit':
          handleEditPress();
          break;
        case 'delete':
          handleDeletePress();
          break;
        default:
          break;
      }
    },
    [handleDeletePress, handleEditPress],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'User Detail',
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="User actions"
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (isGateLoading || !isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && !displayUser) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if ((error && !displayUser) || isNotFound) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState
          message={error ?? 'User not found.'}
          actionLabel="Retry"
          onAction={() => void refresh()}
          style={styles.errorState}
        />
      </View>
    );
  }

  if (!displayUser) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const isDeleting = deletingUserId === displayUser._id;

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
        <AdminUserDetailHero
          user={displayUser}
          isRefreshing={isRefreshing}
          error={error && displayUser ? error : null}
        />

        <View style={styles.cards}>
          <AdminUserDetailInfoCard user={displayUser} />

          {showAddress ? (
            <AdminUserDetailSection title="Address" icon="location-outline">
              <AdminUserDetailFieldList fields={addressFields} />
            </AdminUserDetailSection>
          ) : null}

          <AdminUserDetailOperationsCard
            isDeleting={isDeleting}
            onEditPress={handleEditPress}
            onDeletePress={handleDeletePress}
          />

          {actionError || (error && displayUser) ? (
            <ErrorState
              message={actionError ?? error ?? ''}
              actionLabel={actionError ? 'Dismiss' : 'Retry'}
              onAction={() => {
                if (actionError) {
                  clearActionError();
                } else {
                  void refresh();
                }
              }}
              style={styles.inlineError}
            />
          ) : null}
        </View>
      </ScrollView>

      <AdminProductCardActionsMenu
        visible={menuVisible}
        productName={formatAdminUserDisplayName(displayUser)}
        actions={menuActions.filter((action) => action.id !== 'view')}
        onClose={() => setMenuVisible(false)}
        onSelect={handleMenuSelect}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  cards: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorState: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
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
