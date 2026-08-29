import type { NavigationProp, ParamListBase } from '@react-navigation/native';

import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import type { SellerReviewListItem } from '../types/sellerReview';

type SellerNavigation = NavigationProp<SellerStackParamList & ParamListBase>;

export function navigateToSellerReviewDetail(
  navigation: SellerNavigation,
  reviewId: string,
  initialReview?: SellerReviewListItem,
): void {
  navigation.navigate('SellerReviewDetail', {
    reviewId,
    initialReview,
  });
}
