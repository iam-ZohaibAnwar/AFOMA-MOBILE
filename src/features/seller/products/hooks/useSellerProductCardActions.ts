import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { getErrorMessage } from '../../../../services/api/errors';
import { deleteSellerProduct } from '../../../../services/api/productsApi';
import type { Product } from '../../../../services/types/product';
import {
  submitProductForReview,
  updateProductsActiveStatus,
} from '../api/sellerProductsApi';
import type { SellerProductCardActionId } from '../components/SellerProductCardActionsMenu';
import { buildSellerProductCardActions } from '../utils/sellerProductCardActions';
import { navigateToEditProduct } from '../utils/sellerProductNavigation';

type SellerNavigation = Parameters<typeof navigateToEditProduct>[0];

export function useSellerProductCardActions(
  navigation: SellerNavigation,
  onListChanged: () => void,
) {
  const [menuProduct, setMenuProduct] = useState<Product | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const openMenu = useCallback((product: Product) => {
    setMenuProduct(product);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuProduct(null);
  }, []);

  const runWithBusy = useCallback(async (productId: string, task: () => Promise<void>) => {
    setBusyProductId(productId);
    try {
      await task();
    } finally {
      setBusyProductId(null);
    }
  }, []);

  const handleEdit = useCallback(
    (product: Product) => {
      navigateToEditProduct(navigation, product);
    },
    [navigation],
  );

  const handleSubmitForReview = useCallback(
    (product: Product) => {
      const productId = product._id;
      if (!productId) {
        return;
      }

      void runWithBusy(productId, async () => {
        try {
          await submitProductForReview(productId);
          onListChanged();
        } catch (err) {
          Alert.alert('Submit failed', getErrorMessage(err, 'Failed to submit product for review'));
        }
      });
    },
    [onListChanged, runWithBusy],
  );

  const handleToggleActive = useCallback(
    (product: Product, nextStatus: 0 | 1) => {
      const productId = product._id;
      if (!productId) {
        return;
      }

      void runWithBusy(productId, async () => {
        try {
          await updateProductsActiveStatus([productId], nextStatus);
          onListChanged();
        } catch (err) {
          Alert.alert(
            'Update failed',
            getErrorMessage(err, 'Failed to update product visibility'),
          );
        }
      });
    },
    [onListChanged, runWithBusy],
  );

  const handleDelete = useCallback(
    (product: Product) => {
      const productId = product._id;
      if (!productId) {
        return;
      }

      Alert.alert(
        'Delete product?',
        'This permanently removes the product. This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void runWithBusy(productId, async () => {
                try {
                  await deleteSellerProduct(productId);
                  onListChanged();
                } catch (err) {
                  Alert.alert('Delete failed', getErrorMessage(err, 'Failed to delete product'));
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
    (actionId: SellerProductCardActionId) => {
      const product = menuProduct;
      closeMenu();

      if (!product) {
        return;
      }

      switch (actionId) {
        case 'edit':
          handleEdit(product);
          break;
        case 'submitForReview':
          handleSubmitForReview(product);
          break;
        case 'activate':
          handleToggleActive(product, 1);
          break;
        case 'deactivate':
          handleToggleActive(product, 0);
          break;
        case 'delete':
          handleDelete(product);
          break;
        default:
          break;
      }
    },
    [closeMenu, handleDelete, handleEdit, handleSubmitForReview, handleToggleActive, menuProduct],
  );

  const menuActions = menuProduct ? buildSellerProductCardActions(menuProduct) : [];

  return {
    menuProduct,
    menuActions,
    openMenu,
    closeMenu,
    handleMenuAction,
    handleEdit,
    busyProductId,
  };
}
