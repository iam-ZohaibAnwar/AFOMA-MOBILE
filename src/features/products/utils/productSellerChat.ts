import { Alert } from 'react-native';

import type { ProductSellerRef } from '../../../services/types/product';
import {
  openAuthLogin,
  type AuthReturnTo,
  type NavLike,
} from '../../auth/utils/authNavigation';

/** Same receiver resolution as web PDP handleChatWithSeller. */
export function resolveSellerChatReceiverId(
  seller?: ProductSellerRef | null,
): string | undefined {
  if (!seller) {
    return undefined;
  }

  const receiverId =
    seller.userRole === 'seller' ? seller.userId : seller._id ?? seller.id ?? seller.userId;

  return typeof receiverId === 'string' && receiverId.trim() ? receiverId.trim() : undefined;
}

export function canShowProductSellerMessage(options: {
  seller?: ProductSellerRef | null;
  authUserId?: string;
}): boolean {
  const receiverId = resolveSellerChatReceiverId(options.seller);
  if (!receiverId) {
    return false;
  }

  if (options.authUserId && options.seller?.userId && options.authUserId === options.seller.userId) {
    return false;
  }

  return true;
}

export function buildProductDetailAuthReturnTo(
  productId?: string,
  slug?: string,
  options?: { openChat?: boolean },
): AuthReturnTo {
  return {
    kind: 'screen',
    name: 'ProductDetail',
    params: {
      productId,
      slug,
      openChat: options?.openChat ? true : undefined,
    },
  };
}

function withOpenChatReturnTo(returnTo: AuthReturnTo): AuthReturnTo {
  if (returnTo.kind !== 'screen' || returnTo.name !== 'ProductDetail') {
    return returnTo;
  }

  return {
    ...returnTo,
    params: {
      ...(returnTo.params ?? {}),
      openChat: true,
    },
  };
}

export function openProductSellerChat(options: {
  navigation: NavLike;
  seller?: ProductSellerRef | null;
  isAuthenticated: boolean;
  returnTo: AuthReturnTo;
}): void {
  const receiverId = resolveSellerChatReceiverId(options.seller);
  if (!receiverId) {
    Alert.alert('Unable to message seller', 'Seller contact is not available for this product.');
    return;
  }

  if (!options.isAuthenticated) {
    openAuthLogin(options.navigation, withOpenChatReturnTo(options.returnTo));
    return;
  }

  options.navigation.navigate('ChatThread', { receiverId });
}
