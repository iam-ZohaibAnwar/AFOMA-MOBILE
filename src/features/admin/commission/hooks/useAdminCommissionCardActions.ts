import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminCommissionDisplayRow } from '../types/adminCommission';
import {
  buildAdminCommissionCardActions,
  getAdminCommissionMenuTitle,
} from '../utils/adminCommissionCardActions';
import { canInitiateAdminCommissionPayout } from '../utils/adminCommissionMutationGuards';

type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

interface UseAdminCommissionCardActionsOptions {
  initiatingCommissionId: string | null;
  updatingStatusCommissionId: string | null;
  onInitiatePayout: (row: AdminCommissionDisplayRow) => void;
  onChangeStatus: (row: AdminCommissionDisplayRow) => void;
}

export function useAdminCommissionCardActions(
  navigation: AdminNavigation,
  {
    initiatingCommissionId,
    updatingStatusCommissionId,
    onInitiatePayout,
    onChangeStatus,
  }: UseAdminCommissionCardActionsOptions,
) {
  const [menuRow, setMenuRow] = useState<AdminCommissionDisplayRow | null>(null);

  const menuActions = useMemo(
    () =>
      menuRow
        ? buildAdminCommissionCardActions(
            menuRow,
            initiatingCommissionId,
            updatingStatusCommissionId,
          )
        : [],
    [initiatingCommissionId, menuRow, updatingStatusCommissionId],
  );

  const openMenu = useCallback((row: AdminCommissionDisplayRow) => {
    setMenuRow(row);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuRow(null);
  }, []);

  const handleView = useCallback(
    (row: AdminCommissionDisplayRow) => {
      navigation.navigate('AdminCommissionDetail', {
        commissionId: row.commissionId,
        displayType: row.type,
        initialRow: row,
      });
    },
    [navigation],
  );

  const confirmInitiatePayout = useCallback(
    (row: AdminCommissionDisplayRow) => {
      if (!canInitiateAdminCommissionPayout(row, initiatingCommissionId)) {
        return;
      }

      Alert.alert(
        'Initiate Korapay payout?',
        `Send a payout link email for ${row.recipientName} (${row.orderDisplayId})?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send link',
            onPress: () => onInitiatePayout(row),
          },
        ],
      );
    },
    [initiatingCommissionId, onInitiatePayout],
  );

  const handleMenuAction = useCallback(
    (actionId: AdminProductCardActionId) => {
      const row = menuRow;
      closeMenu();

      if (!row) {
        return;
      }

      switch (actionId) {
        case 'view':
          handleView(row);
          break;
        case 'preview':
          confirmInitiatePayout(row);
          break;
        case 'edit':
          onChangeStatus(row);
          break;
        default:
          break;
      }
    },
    [closeMenu, confirmInitiatePayout, handleView, menuRow, onChangeStatus],
  );

  const busyCommissionId = initiatingCommissionId ?? updatingStatusCommissionId;

  return {
    menuRow,
    menuActions,
    menuTitle: menuRow ? getAdminCommissionMenuTitle(menuRow) : undefined,
    openMenu,
    closeMenu,
    handleView,
    handleMenuAction,
    busyCommissionId,
  };
}
