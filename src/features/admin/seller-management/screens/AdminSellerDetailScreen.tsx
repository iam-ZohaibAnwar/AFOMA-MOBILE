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
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerDetailHero } from '../components/detail/AdminSellerDetailHero';
import { AdminSellerDetailInfoCard } from '../components/detail/AdminSellerDetailInfoCard';
import {
  AdminSellerDetailOperationsCard,
  confirmHideSellerShop,
} from '../components/detail/AdminSellerDetailOperationsCard';
import { AdminSellerDetailSectionsCard } from '../components/detail/AdminSellerDetailSectionsCard';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';
import { useAdminSellerOperations } from '../hooks/useAdminSellerOperations';
import {
  ADMIN_SELLER_DETAIL_SECTIONS,
  type AdminEditableSellerSectionId,
  type AdminSellerDetailSectionId,
} from '../types/adminSellerManagement';
import { buildAdminSellerCardActions } from '../utils/adminSellerCardActions';
import { getAdminSellerDisplayName } from '../utils/adminSellerDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerDetail'>;

function isEditableSection(sectionId: AdminSellerDetailSectionId): sectionId is AdminEditableSellerSectionId {
  return sectionId !== 'basic-information';
}

export function AdminSellerDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerDetail(sellerId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const [menuVisible, setMenuVisible] = useState(false);

  const { seller, isLoading, isRefreshing, error, refresh, syncSessionPatch, applySellerUpdate } =
    useAdminSellerDetail(isAuthorized ? sellerId : undefined, initialSeller);

  const {
    updatingSellerId,
    setShopVisibility,
    deleteSeller,
    actionError,
    clearActionError,
  } = useAdminSellerOperations();

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displaySeller = seller ?? initialSeller;

  const menuActions = useMemo(
    () => (displaySeller ? buildAdminSellerCardActions(displaySeller) : []),
    [displaySeller],
  );

  const handleSectionPress = useCallback(
    (sectionId: AdminSellerDetailSectionId) => {
      if (!displaySeller) {
        return;
      }

      if (sectionId === 'basic-information') {
        navigation.navigate('AdminSellerBasicInformation', {
          sellerId,
          initialSeller: displaySeller,
        });
        return;
      }

      if (isEditableSection(sectionId)) {
        navigation.navigate('AdminSellerSection', {
          sellerId,
          sectionId,
          initialSeller: displaySeller,
        });
      }
    },
    [displaySeller, navigation, sellerId],
  );

  const handleEditBasicInfo = useCallback(() => {
    if (!displaySeller) {
      return;
    }

    navigation.navigate('AdminSellerBasicInformationEdit', {
      sellerId,
      initialSeller: displaySeller,
    });
  }, [displaySeller, navigation, sellerId]);

  const handleEnableShop = useCallback(() => {
    if (!sellerId) {
      return;
    }

    clearActionError();
    void (async () => {
      const updated = await setShopVisibility(sellerId, true);
      if (updated) {
        applySellerUpdate({ shop_status: 1 });
      }
    })();
  }, [applySellerUpdate, clearActionError, sellerId, setShopVisibility]);

  const handleDisableShop = useCallback(() => {
    if (!displaySeller || !sellerId) {
      return;
    }

    confirmHideSellerShop(getAdminSellerDisplayName(displaySeller), () => {
      clearActionError();
      void (async () => {
        const updated = await setShopVisibility(sellerId, false);
        if (updated) {
          applySellerUpdate({ shop_status: 0 });
        }
      })();
    });
  }, [applySellerUpdate, clearActionError, displaySeller, sellerId, setShopVisibility]);

  const handleDeletePress = useCallback(() => {
    if (!displaySeller || !sellerId) {
      return;
    }

    Alert.alert(
      'Delete seller?',
      `This will permanently remove ${getAdminSellerDisplayName(displaySeller)}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            clearActionError();
            void (async () => {
              const deleted = await deleteSeller(sellerId);
              if (deleted) {
                navigation.goBack();
              }
            })();
          },
        },
      ],
    );
  }, [clearActionError, deleteSeller, displaySeller, navigation, sellerId]);

  const handleMenuSelect = useCallback(
    (actionId: AdminProductCardActionId) => {
      setMenuVisible(false);

      switch (actionId) {
        case 'edit':
          handleEditBasicInfo();
          break;
        case 'enable':
          handleEnableShop();
          break;
        case 'disable':
          handleDisableShop();
          break;
        case 'delete':
          handleDeletePress();
          break;
        default:
          break;
      }
    },
    [handleDeletePress, handleDisableShop, handleEditBasicInfo, handleEnableShop],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Seller Detail',
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Seller actions"
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (error && !displaySeller) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} style={styles.errorState} />
      </View>
    );
  }

  if (!displaySeller) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void refresh()}
            tintColor={colors.primary}
          />
        }
      >
        <AdminSellerDetailHero
          seller={displaySeller}
          isRefreshing={isRefreshing}
          error={error && displaySeller ? error : null}
        />

        <View style={styles.cards}>
          <AdminSellerDetailInfoCard seller={displaySeller} />
          <AdminSellerDetailSectionsCard
            sections={ADMIN_SELLER_DETAIL_SECTIONS}
            onSectionPress={handleSectionPress}
          />
          <AdminSellerDetailOperationsCard
            seller={displaySeller}
            isUpdatingVisibility={updatingSellerId === sellerId}
            onEnablePress={handleEnableShop}
            onDisablePress={handleDisableShop}
          />

          {actionError || (error && displaySeller) ? (
            <ErrorState
              message={actionError ?? error ?? ''}
              actionLabel="Dismiss"
              onAction={() => {
                clearActionError();
                if (error) {
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
        productName={getAdminSellerDisplayName(displaySeller)}
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
