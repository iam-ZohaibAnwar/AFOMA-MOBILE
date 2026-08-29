import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { AdminProductCardActionId } from '../../product-management/components/AdminProductCardActionsMenu';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminUserListItem } from '../types/adminUserManagement';
import { buildAdminUserCardActions } from '../utils/adminUserCardActions';
import { formatAdminUserDisplayName } from '../utils/adminUserRoleOptions';

type AdminNavigation = NavigationProp<AdminStackParamList>;

interface UseAdminUserCardActionsOptions {
  deleteUser: (userId: string) => Promise<boolean>;
  deletingUserId: string | null;
  reportActionError: (message: string) => void;
}

export function useAdminUserCardActions(
  navigation: AdminNavigation,
  { deleteUser, deletingUserId, reportActionError }: UseAdminUserCardActionsOptions,
) {
  const [menuUser, setMenuUser] = useState<AdminUserListItem | null>(null);

  const menuActions = useMemo(() => buildAdminUserCardActions(), []);

  const openMenu = useCallback((user: AdminUserListItem) => {
    setMenuUser(user);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuUser(null);
  }, []);

  const handleView = useCallback(
    (user: AdminUserListItem) => {
      if (!user._id) {
        return;
      }

      navigation.navigate('AdminUserDetail', {
        userId: user._id,
        initialUser: user,
      });
    },
    [navigation],
  );

  const handleEdit = useCallback(
    (user: AdminUserListItem) => {
      if (!user._id) {
        return;
      }

      navigation.navigate('AdminUserForm', {
        userId: user._id,
        mode: 'edit',
        initialUser: user,
      });
    },
    [navigation],
  );

  const handleDelete = useCallback(
    (user: AdminUserListItem) => {
      const userId = user._id;
      if (!userId) {
        return;
      }

      if (deletingUserId) {
        reportActionError('Another delete is already in progress.');
        return;
      }

      Alert.alert(
        'Delete user?',
        `This will permanently remove ${formatAdminUserDisplayName(user)}. This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void deleteUser(userId);
            },
          },
        ],
      );
    },
    [deleteUser, deletingUserId, reportActionError],
  );

  const handleMenuAction = useCallback(
    (actionId: AdminProductCardActionId) => {
      const user = menuUser;
      closeMenu();

      if (!user) {
        return;
      }

      switch (actionId) {
        case 'view':
          handleView(user);
          break;
        case 'edit':
          handleEdit(user);
          break;
        case 'delete':
          handleDelete(user);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleDelete, handleEdit, handleView, menuUser],
  );

  return {
    menuUser,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleView,
    handleEdit,
    handleDelete,
    busyUserId: deletingUserId,
  };
}
