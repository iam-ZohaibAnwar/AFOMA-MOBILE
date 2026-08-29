import { useCallback } from 'react';

import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFocusEffect } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { EmptyState } from '../../../../components/ecommerce/EmptyState';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import { OrderListSearchBar } from '../../../orders/components/OrderListSearchBar';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';

import { AdminSellerShippingRow } from '../components/AdminSellerShippingRow';

import { AdminSettingsHubCardSkeleton } from '../components/AdminSettingsHubCardSkeleton';

import { useAdminSellerShippingList } from '../hooks/useAdminSellerShippingList';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsSellerShippingList'>;



const RETURN_TO = authReturnTo.adminSettingsSellerShippingList();

const SKELETON_ITEMS = ['ss1', 'ss2', 'ss3'] as const;



export function AdminSettingsSellerShippingListScreen({ navigation }: Props) {

  const insets = useSafeAreaInsets();

  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  const { sellers, searchInput, setSearchInput, isLoading, isRefreshing, error, refresh } =

    useAdminSellerShippingList(isAuthorized);



  useFocusEffect(

    useCallback(() => {

      if (isAuthorized) {

        void refresh();

      }

    }, [isAuthorized, refresh]),

  );



  const handleSellerPress = useCallback(

    (seller: AdminSellerListItem) => {

      if (!seller._id) {

        return;

      }



      navigation.navigate('AdminSettingsSellerShippingEdit', {

        sellerId: seller._id,

        initialSeller: seller,

      });

    },

    [navigation],

  );



  const renderItem = useCallback(

    ({ item }: { item: AdminSellerListItem }) => (

      <AdminSellerShippingRow seller={item} onPress={() => handleSellerPress(item)} />

    ),

    [handleSellerPress],

  );



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  const showSkeletonList = isLoading && sellers.length === 0 && !error;



  const listHeader = (

    <View style={styles.headerContent}>

      <OrderListSearchBar

        value={searchInput}

        onChangeText={setSearchInput}

        placeholder="Search by seller first name"

        accessibilityLabel="Search sellers by first name"

      />



      {sellers.length > 0 ? (

        <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>

          {sellers.length} seller{sellers.length === 1 ? '' : 's'}

        </AppText>

      ) : null}



      {error && sellers.length > 0 ? (

        <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />

      ) : null}

    </View>

  );



  if (error && sellers.length === 0) {

    return (

      <View style={[styles.screen, { paddingBottom: insets.bottom }]}>

        {listHeader}

        <ErrorState message={error} onAction={() => void refresh()} style={styles.blockError} />

      </View>

    );

  }



  return (

    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>

      <FlatList

        data={sellers}

        keyExtractor={(item) => item._id}

        renderItem={renderItem}

        ListHeaderComponent={listHeader}

        contentContainerStyle={styles.listContent}

        ItemSeparatorComponent={() => <View style={styles.separator} />}

        refreshControl={

          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />

        }

        ListEmptyComponent={

          showSkeletonList ? (

            <View style={styles.skeletonList}>

              {SKELETON_ITEMS.map((key) => (

                <AdminSettingsHubCardSkeleton key={key} />

              ))}

            </View>

          ) : !isLoading && !error ? (

            <EmptyState

              title="No sellers found"

              message={

                searchInput.trim()

                  ? 'Try a different search term.'

                  : 'No seller accounts are available.'

              }

              actionLabel={searchInput.trim() ? 'Clear search' : 'Refresh'}

              onAction={() => (searchInput.trim() ? setSearchInput('') : void refresh())}

              style={styles.emptyState}

            />

          ) : null

        }

      />

    </View>

  );

}



const styles = StyleSheet.create({

  screen: {

    flex: 1,

    backgroundColor: colors.background,

  },

  headerContent: {

    gap: spacing.md,

    paddingBottom: spacing.md,

  },

  countText: {

    marginTop: -spacing.xs,

  },

  listContent: {

    paddingHorizontal: spacing.lg,

    paddingBottom: spacing.xxl,

    flexGrow: 1,

  },

  separator: {

    height: spacing.sm,

  },

  skeletonList: {

    gap: spacing.md,

    marginTop: spacing.lg,

  },

  inlineError: {

    marginHorizontal: 0,

    alignSelf: 'stretch',

  },

  blockError: {

    marginHorizontal: spacing.lg,

    marginTop: spacing.lg,

  },

  emptyState: {

    marginHorizontal: 0,

    alignSelf: 'stretch',

    marginTop: spacing.lg,

  },

});

