import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { colors } from '../../../design-system';
import { navigateToCategoryTab } from '../../../app/navigation/shoppingNavigation';
import type { MainTabParamList } from '../../../app/navigation/types';

type Props = BottomTabScreenProps<MainTabParamList, 'ShopTab'>;

/** Legacy tab route — deep links to /browse redirect to the category browse hub. */
export function ShopScreen({ navigation }: Props) {
  useFocusEffect(
    useCallback(() => {
      navigateToCategoryTab(navigation);
    }, [navigation]),
  );

  return <View style={styles.screen} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
