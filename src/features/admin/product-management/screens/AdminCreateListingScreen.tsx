import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../../../design-system';
import type { AdminStackParamList } from '../../navigation/adminTypes';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminCreateListing'>;

/** Legacy entry — redirects to product type picker (AI photos happen once after type selection). */
export function AdminCreateListingScreen({ navigation, route }: Props) {
  const sellerId = route.params?.sellerId;
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) {
      return;
    }

    redirectedRef.current = true;
    navigation.replace('AdminProductType', {
      sellerId: sellerId?.trim() || undefined,
    });
  }, [navigation, sellerId]);

  return (
    <View style={styles.centeredState}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
