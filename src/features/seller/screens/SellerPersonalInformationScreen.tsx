import { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerPersonalInformation'>;

/** Legacy route — unified into Shop profile hub (web my-account parity). */
export function SellerPersonalInformationScreen({ navigation }: Props) {
  useEffect(() => {
    navigation.replace('SellerShopProfile');
  }, [navigation]);

  return null;
}
