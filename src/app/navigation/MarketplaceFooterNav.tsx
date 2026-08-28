import { Pressable, StyleSheet, View } from 'react-native';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { AppText } from '../../components/ui/AppText';

import { colors, typography } from '../../design-system';

import { useAuth } from '../../features/auth/hooks/useAuth';

import { authReturnTo, openAuthLogin } from '../../features/auth/utils/authNavigation';

import {

  getMarketplaceTabBarBottomInset,

  MARKETPLACE_TAB_BAR_HEIGHT,

} from './marketplaceTabBarLayout';

import type { MainTabParamList } from './types';

import { TabBarIcon, type TabIconName } from './TabBarIcon';

import type { MarketplaceTabSegment } from './marketplaceChrome/resolveMarketplaceActiveTab';



interface MarketplaceTabItem {

  key: string;

  label: string;

  icon: TabIconName;

  routeName: keyof MainTabParamList;

  segment?: MarketplaceTabSegment;

}



const TAB_ITEMS: MarketplaceTabItem[] = [

  { key: 'home', label: 'Home', icon: 'home', routeName: 'MarketplaceTab', segment: 'home' },

  { key: 'shop', label: 'Shop', icon: 'search', routeName: 'MarketplaceTab', segment: 'category' },

  { key: 'cart', label: 'Cart', icon: 'cart', routeName: 'CartTab' },

  { key: 'account', label: 'Account', icon: 'account', routeName: 'AccountTab' },

];



function resolveFooterSegment(

  activeRouteName: keyof MainTabParamList,

  marketplaceSegment?: MarketplaceTabSegment,

): MarketplaceTabSegment {

  if (activeRouteName === 'ShopTab') {

    return 'category';

  }



  if (activeRouteName === 'MarketplaceTab') {

    return marketplaceSegment === 'category' ? 'category' : 'home';

  }



  return 'home';

}



export interface MarketplaceFooterNavProps {

  activeRouteName: keyof MainTabParamList;

  marketplaceSegment?: MarketplaceTabSegment;

  navigation: NavigationProp<ParamListBase>;

  cartCount?: number;

}



export function MarketplaceFooterNav({

  activeRouteName,

  marketplaceSegment,

  navigation,

  cartCount = 0,

}: MarketplaceFooterNavProps) {

  const insets = useSafeAreaInsets();

  const { isAuthenticated, isLoading } = useAuth();

  const bottomInset = getMarketplaceTabBarBottomInset(insets.bottom);

  const footerSegment = resolveFooterSegment(activeRouteName, marketplaceSegment);



  return (

    <View

      style={[

        styles.container,

        {

          height: MARKETPLACE_TAB_BAR_HEIGHT + bottomInset,

          paddingBottom: bottomInset,

        },

      ]}

    >

      {TAB_ITEMS.map((item) => {

        const isMarketplaceSegmentItem =

          item.routeName === 'MarketplaceTab' && item.segment != null;

        const isFocused = isMarketplaceSegmentItem

          ? (activeRouteName === 'MarketplaceTab' || activeRouteName === 'ShopTab') &&

            footerSegment === item.segment

          : activeRouteName === item.routeName;



        const color = isFocused ? colors.primary : colors.textMuted;



        const onPress = () => {

          if (item.routeName === 'AccountTab' && !isLoading && !isAuthenticated) {

            openAuthLogin(navigation, authReturnTo.homeTab());

            return;

          }



          if (isMarketplaceSegmentItem && item.segment) {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'MainTabs',
                params: {
                  screen: 'MarketplaceTab',
                  params: { segment: item.segment },
                },
              }),
            );
            return;
          }


          navigation.navigate('MainTabs', { screen: item.routeName });

        };



        return (

          <Pressable

            key={item.key}

            accessibilityRole="button"

            accessibilityState={{ selected: isFocused }}

            accessibilityLabel={item.label}

            onPress={onPress}

            style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}

          >

            <TabBarIcon

              name={item.icon}

              color={color}

              focused={isFocused}

              badgeCount={item.routeName === 'CartTab' ? cartCount : 0}

            />

            <AppText variant="caption" style={[styles.tabLabel, { color }]}>

              {item.label}

            </AppText>

          </Pressable>

        );

      })}

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    paddingTop: 6,

    backgroundColor: colors.background,

    borderTopColor: colors.border,

    borderTopWidth: StyleSheet.hairlineWidth,

  },

  tabItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingTop: 2,

    gap: 2,

  },

  tabLabel: {

    ...typography.caption,

    fontSize: 11,

    fontWeight: '600',

  },

  pressed: {

    opacity: 0.88,

  },

});


