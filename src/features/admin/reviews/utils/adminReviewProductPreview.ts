import type { NavigationProp } from '@react-navigation/native';

import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminReviewListItem } from '../types/adminReviews';
import { isPopulatedAdminReviewProduct } from './adminReviewsContent';

type AdminNavigation = NavigationProp<AdminStackParamList>;

export function navigateToAdminReviewProductPreview(
  navigation: AdminNavigation,
  review: AdminReviewListItem,
): boolean {
  if (!isPopulatedAdminReviewProduct(review.productId)) {
    return false;
  }

  const productId = review.productId._id?.trim();
  const slug = review.productId.slug?.trim();

  if (!productId && !slug) {
    return false;
  }

  navigation.getParent()?.navigate('Shopping', {
    screen: 'ProductDetail',
    params: {
      ...(productId ? { productId } : {}),
      ...(slug ? { slug } : {}),
    },
  });

  return true;
}
