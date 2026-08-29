import { useCallback, useState } from 'react';

import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFocusEffect } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { EmptyState } from '../../../../components/ecommerce/EmptyState';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { AppButton } from '../../../../components/ui/AppButton';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import { useAuth } from '../../../auth/hooks/useAuth';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';

import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { AdminFeaturedShopPickerSheet } from '../components/AdminFeaturedShopPickerSheet';

import { AdminFeaturedShopRow } from '../components/AdminFeaturedShopRow';

import { AdminSettingsDetailHero } from '../components/AdminSettingsDetailHero';

import { useAdminFeaturedShopPicker } from '../hooks/useAdminFeaturedShopPicker';

import { useAdminFeaturedShopsEditor } from '../hooks/useAdminFeaturedShopsEditor';

import { ADMIN_FEATURED_SHOPS_MAX } from '../utils/adminSettingsConstants';

import {

  getAdminFeaturedShopSellerId,

  toAdminFeaturedShopSellerPayload,

} from '../utils/adminSettingsContent';

import { formatAdminFeaturedShopsMeta } from '../utils/adminSettingsDisplay';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsFeaturedShops'>;



const RETURN_TO = authReturnTo.adminSettingsFeaturedShops();



export function AdminSettingsFeaturedShopsScreen(_props: Props) {

  const insets = useSafeAreaInsets();

  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  const { user } = useAuth();

  const createdBy = resolveAuthUserId(user);

  const [pickerVisible, setPickerVisible] = useState(false);

  const [selectionError, setSelectionError] = useState<string | null>(null);



  const {

    draftShops,

    selectedSellerIds,

    isDirty,

    isSaving,

    saveError,

    canSave,

    error: loadError,

    isLoading,

    isRefreshing,

    addShop,

    removeShop,

    moveShop,

    save,

    refresh,

    clearSaveError,

  } = useAdminFeaturedShopsEditor({

    enabled: isAuthorized,

    createdBy,

  });



  const picker = useAdminFeaturedShopPicker({

    enabled: isAuthorized && pickerVisible,

  });



  useFocusEffect(

    useCallback(() => {

      if (isAuthorized) {

        void refresh();

      }

    }, [isAuthorized, refresh]),

  );



  const handleToggleSeller = useCallback(

    (seller: AdminSellerListItem) => {

      const sellerId = seller._id;

      if (!sellerId) {

        return;

      }



      if (selectedSellerIds.has(sellerId)) {

        removeShop(sellerId);

        setSelectionError(null);

        return;

      }



      const result = addShop(toAdminFeaturedShopSellerPayload(seller));

      if (!result.ok) {

        setSelectionError(result.error);

        return;

      }



      setSelectionError(null);

    },

    [addShop, removeShop, selectedSellerIds],

  );



  const openPicker = useCallback(() => {

    setSelectionError(null);

    setPickerVisible(true);

  }, []);



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  const canSelectMore = draftShops.length < ADMIN_FEATURED_SHOPS_MAX;

  const statusMeta = formatAdminFeaturedShopsMeta(draftShops.length);



  return (

    <>

      <ScrollView

        style={styles.screen}

        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}

        refreshControl={

          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />

        }

      >

        <AdminSettingsDetailHero

          title="Featured Shops"

          icon="storefront-outline"

          statusLabel={statusMeta.label}

          statusIcon={statusMeta.icon}

        />



        <View style={styles.toolbar}>

          <AppButton

            label={canSelectMore ? 'Add shop' : 'Maximum reached'}

            variant="outline"

            onPress={openPicker}

            disabled={!canSelectMore || isSaving}

          />

          <AppButton

            label={isSaving ? 'Saving…' : 'Save changes'}

            onPress={() => void save()}

            loading={isSaving}

            disabled={!canSave}

          />

        </View>



        <AdminProductDetailCardShell title="Selected shops" icon="star-outline" accent={draftShops.length > 0}>

          {draftShops.length > 0 ? (

            <View style={styles.list}>

              {draftShops.map((shop, index) => {

                const shopId = getAdminFeaturedShopSellerId(shop);

                if (!shopId) {

                  return null;

                }



                return (

                  <AdminFeaturedShopRow

                    key={shopId}

                    shop={shop}

                    index={index}

                    total={draftShops.length}

                    disabled={isSaving}

                    onMoveUp={() => moveShop(shopId, 'up')}

                    onMoveDown={() => moveShop(shopId, 'down')}

                    onRemove={() => removeShop(shopId)}

                  />

                );

              })}

            </View>

          ) : isLoading ? (

            <AppText variant="bodyMedium" color="textSecondary">

              Loading featured shops…

            </AppText>

          ) : (

            <EmptyState

              title="No featured shops yet"

              message="Add approved active sellers to appear in the marketplace spotlight."

              actionLabel="Add shop"

              onAction={openPicker}

              style={styles.emptyState}

            />

          )}

        </AdminProductDetailCardShell>



        {isDirty ? (

          <AppText variant="caption" color="textSecondary">

            You have unsaved changes.

          </AppText>

        ) : null}



        {saveError ? (

          <ErrorState message={saveError} onAction={clearSaveError} style={styles.error} />

        ) : null}



        {loadError && draftShops.length === 0 ? (

          <ErrorState message={loadError} onAction={() => void refresh()} style={styles.error} />

        ) : null}

      </ScrollView>



      <AdminFeaturedShopPickerSheet

        visible={pickerVisible}

        sellers={picker.sellers}

        selectedSellerIds={selectedSellerIds}

        searchValue={picker.searchInput}

        isLoading={picker.isLoading}

        error={picker.error}

        selectionError={selectionError}

        canSelectMore={canSelectMore}

        onSearchChange={picker.setSearchInput}

        onClose={() => setPickerVisible(false)}

        onToggleSeller={handleToggleSeller}

        onRetry={() => void picker.reload()}

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

    padding: spacing.lg,

    gap: spacing.lg,

  },

  toolbar: {

    gap: spacing.sm,

  },

  list: {

    gap: spacing.sm,

  },

  emptyState: {

    marginHorizontal: 0,

    alignSelf: 'stretch',

  },

  error: {

    marginHorizontal: 0,

    alignSelf: 'stretch',

  },

});

