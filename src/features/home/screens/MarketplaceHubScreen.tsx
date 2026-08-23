import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../../design-system';
import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { CategoryMarketplaceContent } from '../../categories/components/CategoryMarketplaceContent';
import {
  HomeMarketplaceContent,
  type HomeMarketplaceNavigationProp,
} from '../components/HomeMarketplaceContent';
import { MarketplaceTopChrome } from '../components/MarketplaceTopChrome';
import type { HomeCategoryTab } from '../components/HomeCategoryTabs';

type Props = BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>;

type HubNavigationProp = CompositeNavigationProp<
  BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>['navigation'],
  NativeStackNavigationProp<ShoppingStackParamList>
>;

function getSegmentFromParams(params: MainTabParamList['MarketplaceTab']): HomeCategoryTab {
  return params?.segment === 'category' ? 'category' : 'home';
}

export function MarketplaceHubScreen({ route, navigation }: Props) {
  const [activeSegment, setActiveSegment] = useState<HomeCategoryTab>(() =>
    getSegmentFromParams(route.params),
  );

  const hubNavigation = navigation as HubNavigationProp;
  const contentNavigation = hubNavigation as HomeMarketplaceNavigationProp;

  useEffect(() => {
    setActiveSegment(getSegmentFromParams(route.params));
  }, [route.params?.segment]);

  const handleSearchPress = () => {
    hubNavigation.navigate('Search', {});
  };

  return (
    <View style={styles.screen}>
      <MarketplaceTopChrome activeTab={activeSegment} onSearchPress={handleSearchPress} />

      <View style={styles.content}>
        {activeSegment === 'home' ? (
          <HomeMarketplaceContent navigation={contentNavigation} />
        ) : (
          <CategoryMarketplaceContent navigation={contentNavigation} />
        )}
      </View>
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
