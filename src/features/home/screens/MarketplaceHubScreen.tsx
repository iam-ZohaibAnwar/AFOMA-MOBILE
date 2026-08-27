import { StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  navigateToAccountTab,
  navigateToHomeTab,
} from '../../../app/navigation/shoppingNavigation';
import type { MainTabParamList, ShoppingStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../design-system';
import { authReturnTo, openAuthLogin } from '../../auth/utils/authNavigation';
import { useAuth } from '../../auth/hooks/useAuth';
import { CategoryMarketplaceContent } from '../../categories/components/CategoryMarketplaceContent';
import {
  HomeMarketplaceContent,
  type HomeMarketplaceNavigationProp,
} from '../components/HomeMarketplaceContent';
import { MarketplaceTopChrome } from '../components/MarketplaceTopChrome';
import { ShopSearchField } from '../../shop/components/ShopSearchField';

type Props = BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>;

type HubNavigationProp = CompositeNavigationProp<
  BottomTabScreenProps<MainTabParamList, 'MarketplaceTab'>['navigation'],
  NativeStackNavigationProp<ShoppingStackParamList>
>;

type MarketplaceTabRouteProp = RouteProp<MainTabParamList, 'MarketplaceTab'>;

export function MarketplaceHubScreen({ navigation }: Props) {
  const route = useRoute<MarketplaceTabRouteProp>();
  const isCategoryBrowse = route.params?.segment === 'category';
  const { isAuthenticated, isLoading } = useAuth();

  const hubNavigation = navigation as HubNavigationProp;
  const contentNavigation = hubNavigation as HomeMarketplaceNavigationProp;

  const handleSearchPress = () => {
    hubNavigation.navigate('Search', {});
  };

  const handleProfilePress = () => {
    if (!isLoading && !isAuthenticated) {
      openAuthLogin(hubNavigation, authReturnTo.accountTab());
      return;
    }

    navigateToAccountTab(hubNavigation);
  };

  const handleCategoryBackPress = () => {
    navigateToHomeTab(hubNavigation);
  };

  if (isCategoryBrowse) {
    return (
      <View style={styles.screen}>
        <ShopSearchField
          onPress={handleSearchPress}
          onBackPress={handleCategoryBackPress}
        />
        <View style={styles.content}>
          <CategoryMarketplaceContent navigation={contentNavigation} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MarketplaceTopChrome
        onProfilePress={handleProfilePress}
        onSearchPress={handleSearchPress}
      />
      <View style={styles.content}>
        <HomeMarketplaceContent navigation={contentNavigation} />
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
