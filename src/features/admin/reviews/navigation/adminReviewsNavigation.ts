import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import type { AdminReviewListItem } from '../types/adminReviews';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;
type AdminNavigation = NativeStackNavigationProp<AdminStackParamList>;

export function navigateToAdminReviewsFromRoot(navigation: RootNavigation): void {
  navigation.navigate('Admin', {
    screen: 'AdminReviews',
  } as NavigatorScreenParams<AdminStackParamList>);
}

export function navigateToAdminReviews(navigation: AdminNavigation): void {
  navigation.navigate('AdminReviews');
}

export function navigateToAdminReviewDetail(
  navigation: AdminNavigation,
  reviewId: string,
  initialReview?: AdminReviewListItem,
): void {
  navigation.navigate('AdminReviewDetail', {
    reviewId,
    initialReview,
  });
}
