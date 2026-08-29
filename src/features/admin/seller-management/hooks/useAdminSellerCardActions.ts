import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getErrorMessage } from '../../../../services/api/errors';
import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import {
  deleteAdminSeller,
  updateAdminSellerShopVisibility,
} from '../api/adminSellerManagementApi';
import type { AdminSellerListItem } from '../types/adminSellerManagement';
import { buildAdminSellerCardActions } from '../utils/adminSellerCardActions';
import { getAdminSellerDisplayName } from '../utils/adminSellerDisplay';
import { requestAdminSellerListRefresh } from '../state/adminSellerListRefresh';

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function useAdminSellerCardActions(
  navigation: AdminNavigation,
  onListChanged: () => void,
) {
  const [menuSeller, setMenuSeller] = useState<AdminSellerListItem | null>(null);
  const [busySellerId, setBusySellerId] = useState<string | null>(null);

  const menuActions = useMemo(
    () => (menuSeller ? buildAdminSellerCardActions(menuSeller) : []),
    [menuSeller],
  );

  const openMenu = useCallback((seller: AdminSellerListItem) => {
    setMenuSeller(seller);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuSeller(null);
  }, []);

  const runWithBusy = useCallback(async (sellerId: string, task: () => Promise<void>) => {
    setBusySellerId(sellerId);
    try {
      await task();
    } finally {
      setBusySellerId(null);
    }
  }, []);

  const handleView = useCallback(
    (seller: AdminSellerListItem) => {
      if (!seller._id) {
        return;
      }

      navigation.navigate('AdminSellerDetail', {
        sellerId: seller._id,
        initialSeller: seller,
      });
    },
    [navigation],
  );

  const handleEdit = useCallback(
    (seller: AdminSellerListItem) => {
      if (!seller._id) {
        return;
      }

      navigation.navigate('AdminSellerBasicInformationEdit', {
        sellerId: seller._id,
        initialSeller: seller,
      });
    },
    [navigation],
  );

  const handleVisibilityChange = useCallback(
    (seller: AdminSellerListItem, nextVisible: boolean) => {
      const sellerId = seller._id;
      if (!sellerId) {
        return;
      }

      const sellerName = getAdminSellerDisplayName(seller);

      const applyChange = () => {
        void runWithBusy(sellerId, async () => {
          try {
            await updateAdminSellerShopVisibility(sellerId, nextVisible ? 1 : 0);
            requestAdminSellerListRefresh();
            onListChanged();
          } catch (err) {
            Alert.alert('Update failed', getErrorMessage(err, 'Failed to update shop visibility'));
          }
        });
      };

      if (!nextVisible) {
        Alert.alert(
          'Hide this shop?',
          `${sellerName} will be hidden from buyers until visibility is turned back on.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Hide shop', style: 'destructive', onPress: applyChange },
          ],
        );
        return;
      }

      applyChange();
    },
    [onListChanged, runWithBusy],
  );

  const handleDelete = useCallback(
    (seller: AdminSellerListItem) => {
      const sellerId = seller._id;
      if (!sellerId) {
        return;
      }

      const sellerName = getAdminSellerDisplayName(seller);

      Alert.alert(
        'Delete seller?',
        `This will permanently remove ${sellerName}. This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void runWithBusy(sellerId, async () => {
                try {
                  await deleteAdminSeller(sellerId);
                  requestAdminSellerListRefresh();
                  onListChanged();
                } catch (err) {
                  Alert.alert('Delete failed', getErrorMessage(err, 'Failed to delete seller'));
                }
              });
            },
          },
        ],
      );
    },
    [onListChanged, runWithBusy],
  );

  const handleMenuAction = useCallback(
    (actionId: AdminProductCardActionId) => {
      const seller = menuSeller;
      closeMenu();

      if (!seller) {
        return;
      }

      switch (actionId) {
        case 'view':
          handleView(seller);
          break;
        case 'edit':
          handleEdit(seller);
          break;
        case 'enable':
          handleVisibilityChange(seller, true);
          break;
        case 'disable':
          handleVisibilityChange(seller, false);
          break;
        case 'delete':
          handleDelete(seller);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleDelete, handleEdit, handleView, handleVisibilityChange, menuSeller],
  );

  return {
    menuSeller,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleView,
    busySellerId,
  };
}
