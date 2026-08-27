import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';



import { AppText } from '../../../components/ui/AppText';

import { colors, shadows, spacing, typography } from '../../../design-system';

import { useAuth } from '../../../features/auth/hooks/useAuth';

import { useCart } from '../../../features/cart/hooks/useCart';

import { getCartItemCount } from '../../../features/cart/utils/cartUtils';

import { authReturnTo, openAuthLogin } from '../../../features/auth/utils/authNavigation';

import { resolveAuthUserId } from '../../../features/auth/utils/resolveAuthUserId';

import { TabBarIcon, type TabIconName } from '../TabBarIcon';

import type { MainTabParamList } from '../types';

import { marketplaceNavigationRef } from './marketplaceNavigationRef';

import { MARKETPLACE_FOOTER_PILL_HEIGHT } from './marketplaceFooterLayout';

import {

  resolveMarketplaceActiveTab,

  resolveMarketplaceTabSegment,

  type MarketplaceTabSegment,

} from './resolveMarketplaceActiveTab';

import { useMarketplaceChrome } from './MarketplaceChromeProvider';
import { registerCartTabCenter } from '../../../features/cart/utils/cartFeedback';



interface MarketplaceTabItem {

  key: string;

  label: string;

  icon: TabIconName;

  routeName: keyof MainTabParamList;

  segment?: MarketplaceTabSegment;

}



const TAB_ITEMS: MarketplaceTabItem[] = [

  { key: 'home', label: 'Home', icon: 'home', routeName: 'MarketplaceTab', segment: 'home' },

  { key: 'shop', label: 'Shop', icon: 'shop', routeName: 'MarketplaceTab', segment: 'category' },

  { key: 'cart', label: 'Cart', icon: 'cart', routeName: 'CartTab' },

  { key: 'account', label: 'Account', icon: 'account', routeName: 'AccountTab' },

];



const TAB_INDICATOR_INSET = 6;



function resolveFooterSegment(

  activeRouteName: keyof MainTabParamList | null,

  marketplaceSegment: MarketplaceTabSegment | undefined,

): MarketplaceTabSegment {

  if (activeRouteName === 'ShopTab') {

    return 'category';

  }



  if (activeRouteName === 'MarketplaceTab') {

    return marketplaceSegment === 'category' ? 'category' : 'home';

  }



  return 'home';

}



function resolveActiveTabIndex(

  activeRouteName: keyof MainTabParamList | null,

  footerSegment: MarketplaceTabSegment,

): number {

  if (activeRouteName === 'MarketplaceTab' || activeRouteName === 'ShopTab') {

    const index = TAB_ITEMS.findIndex(

      (item) => item.routeName === 'MarketplaceTab' && item.segment === footerSegment,

    );

    return index >= 0 ? index : 0;

  }



  if (!activeRouteName) {

    return 0;

  }



  const index = TAB_ITEMS.findIndex((item) => item.routeName === activeRouteName);

  return index >= 0 ? index : 0;

}



export interface MarketplaceFooterPillProps {

  /** When set, animates the pill vertically (global floating footer). */

  translateY?: Animated.Value;

}



export function MarketplaceFooterPill({ translateY }: MarketplaceFooterPillProps) {

  const { rootNavState } = useMarketplaceChrome();

  const { isAuthenticated, isLoading, user } = useAuth();

  const authUserId = resolveAuthUserId(user);

  const { cart } = useCart(authUserId);

  const cartCount = getCartItemCount(cart);



  const activeRouteName = resolveMarketplaceActiveTab(rootNavState);

  const marketplaceSegment = resolveMarketplaceTabSegment(rootNavState);

  const footerSegment = resolveFooterSegment(activeRouteName, marketplaceSegment);

  const activeTabIndex = useMemo(

    () => resolveActiveTabIndex(activeRouteName, footerSegment),

    [activeRouteName, footerSegment],

  );

  const [tabRowWidth, setTabRowWidth] = useState(0);

  const cartTabRef = useRef<View>(null);

  const indicatorX = useRef(new Animated.Value(0)).current;

  const hasAnimatedIndicator = useRef(false);



  const tabSlotWidth = tabRowWidth > 0 ? tabRowWidth / TAB_ITEMS.length : 0;

  const indicatorWidth = Math.max(tabSlotWidth - TAB_INDICATOR_INSET * 2, 0);



  useEffect(() => {

    if (tabSlotWidth <= 0) {

      return;

    }



    const nextX = activeTabIndex * tabSlotWidth + TAB_INDICATOR_INSET;



    if (!hasAnimatedIndicator.current) {

      indicatorX.setValue(nextX);

      hasAnimatedIndicator.current = true;

      return;

    }



    Animated.spring(indicatorX, {

      toValue: nextX,

      useNativeDriver: true,

      tension: 140,

      friction: 16,

    }).start();

  }, [activeTabIndex, indicatorX, tabSlotWidth]);

  const measureCartTabCenter = () => {
    cartTabRef.current?.measureInWindow((x, y, width, height) => {
      registerCartTabCenter({
        x: x + width / 2,
        y: y + height / 2,
      });
    });
  };

  useEffect(() => {
    if (tabRowWidth <= 0) {
      return;
    }
    requestAnimationFrame(measureCartTabCenter);
  }, [tabRowWidth, activeTabIndex]);

  return (

    <Animated.View

      style={[

        styles.pill,

        shadows.floating,

        translateY ? { transform: [{ translateY }] } : null,

      ]}

    >

      <View

        style={styles.tabRow}

        onLayout={(event) => {

          const nextWidth = event.nativeEvent.layout.width;

          if (nextWidth !== tabRowWidth) {

            setTabRowWidth(nextWidth);

          }

        }}

      >

        {indicatorWidth > 0 ? (

          <Animated.View

            pointerEvents="none"

            style={[

              styles.tabIndicator,

              {

                width: indicatorWidth,

                transform: [{ translateX: indicatorX }],

              },

            ]}

          />

        ) : null}



        {TAB_ITEMS.map((item) => {

          const isMarketplaceSegmentItem =

            item.routeName === 'MarketplaceTab' && item.segment != null;

          const isFocused = isMarketplaceSegmentItem

            ? (activeRouteName === 'MarketplaceTab' || activeRouteName === 'ShopTab') &&

              footerSegment === item.segment

            : activeRouteName === item.routeName;



          const color = isFocused ? colors.primary : colors.textMuted;



          const onPress = () => {

            if (!marketplaceNavigationRef.isReady()) {

              return;

            }



            if (item.routeName === 'AccountTab' && !isLoading && !isAuthenticated) {

              openAuthLogin(marketplaceNavigationRef, authReturnTo.homeTab());

              return;

            }



            if (isMarketplaceSegmentItem && item.segment) {
              marketplaceNavigationRef.dispatch(
                CommonActions.navigate({
                  name: 'Shopping',
                  params: {
                    screen: 'MainTabs',
                    params: {
                      screen: 'MarketplaceTab',
                      params: { segment: item.segment },
                    },
                  },
                  merge: true,
                }),
              );
              return;
            }



            marketplaceNavigationRef.navigate('Shopping', {

              screen: 'MainTabs',

              params: { screen: item.routeName },

            });

          };



          return (

            <Pressable

              key={item.key}

              ref={item.key === 'cart' ? cartTabRef : undefined}

              onLayout={item.key === 'cart' ? measureCartTabCenter : undefined}

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

    </Animated.View>

  );

}



const styles = StyleSheet.create({

  pill: {

    flexDirection: 'row',

    alignItems: 'center',

    minHeight: MARKETPLACE_FOOTER_PILL_HEIGHT,

    borderRadius: MARKETPLACE_FOOTER_PILL_HEIGHT / 2,

    backgroundColor: 'rgba(255, 255, 255, 0.94)',

    borderWidth: StyleSheet.hairlineWidth,

    borderColor: colors.borderStrong,

    paddingHorizontal: spacing.sm,

    paddingTop: 4,

  },

  tabRow: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    position: 'relative',

  },

  tabIndicator: {

    position: 'absolute',

    top: 2,

    bottom: 2,

    borderRadius: (MARKETPLACE_FOOTER_PILL_HEIGHT - 8) / 2,

    backgroundColor: colors.primarySoft,

  },

  tabItem: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingTop: 2,

    gap: 2,

    zIndex: 1,

  },

  tabLabel: {

    ...typography.caption,

    fontSize: 10,

    fontWeight: '600',

  },

  pressed: {

    opacity: 0.88,

  },

});


