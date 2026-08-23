import { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerAccount'>;

/** Legacy route — redirects to Dashboard. Account tab is the seller entry point. */
export function SellerAccountScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.replace('SellerDashboard');
  }, [navigation]);

  return null;
}
