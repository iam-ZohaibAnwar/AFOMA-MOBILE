import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';
import { AdminSellerShippingRow } from '../components/AdminSellerShippingRow';
import { useAdminSellerShippingList } from '../hooks/useAdminSellerShippingList';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsSellerShippingList'>;

const RETURN_TO = authReturnTo.adminSettingsSellerShippingList();

export function AdminSettingsSellerShippingListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const { sellers, searchInput, setSearchInput, isLoading, isRefreshing, error, refresh } =
    useAdminSellerShippingList(isAuthorized);

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

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <AppText variant="bodyMedium" color="textSecondary">
          Choose a seller to view or edit their shipping configuration.
        </AppText>
        <SearchBar
          mode="input"
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search by seller first name"
        />
      </View>

      {error && sellers.length === 0 ? (
        <ErrorState message={error} onAction={() => void refresh()} style={styles.error} />
      ) : null}

      {isLoading && sellers.length === 0 && !error ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}

      {!isLoading && sellers.length === 0 && !error ? (
        <EmptyState
          title="No sellers found"
          message={searchInput.trim() ? 'Try a different search term.' : 'No seller accounts are available.'}
          actionLabel={searchInput.trim() ? 'Clear search' : 'Refresh'}
          onAction={() => (searchInput.trim() ? setSearchInput('') : void refresh())}
        />
      ) : null}

      <FlatList
        data={sellers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <AdminSellerShippingRow seller={item} onPress={() => handleSellerPress(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  error: {
    marginHorizontal: spacing.lg,
  },
});
