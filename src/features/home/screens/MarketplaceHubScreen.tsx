import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../../design-system';
import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryDrawer } from '../../categories/components/CategoryDrawer';
import {
  HomeMarketplaceContent,
  type HomeMarketplaceNavigationProp,
} from '../components/HomeMarketplaceContent';
import { MarketplaceTopChrome } from '../components/MarketplaceTopChrome';

type Props = BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>;

type HubNavigationProp = CompositeNavigationProp<
  BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>['navigation'],
  NativeStackNavigationProp<ShoppingStackParamList>
>;

export function MarketplaceHubScreen({ navigation }: Props) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const hubNavigation = navigation as HubNavigationProp;
  const contentNavigation = hubNavigation as HomeMarketplaceNavigationProp;

  const handleSearchPress = () => {
    hubNavigation.navigate('Search', {});
  };

  return (
    <View style={styles.screen}>
      <MarketplaceTopChrome
        onMenuPress={() => setDrawerVisible(true)}
        onSearchPress={handleSearchPress}
      />

      <View style={styles.content}>
        <HomeMarketplaceContent navigation={contentNavigation} />
      </View>

      <CategoryDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={hubNavigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
