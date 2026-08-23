import { Pressable, StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';



import { AppText } from '../../../components/ui/AppText';

import { colors, screenPaddingHorizontal, spacing } from '../../../design-system';

import type { MainTabParamList } from '../../../app/navigation/types';



export type HomeCategoryTab = 'home' | 'category';



export interface HomeCategoryTabsProps {

  activeTab: HomeCategoryTab;

}



export function HomeCategoryTabs({ activeTab }: HomeCategoryTabsProps) {

  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();



  const switchTab = (segment: HomeCategoryTab) => {

    if (segment === activeTab) {

      return;

    }



    tabNavigation.navigate('MarketplaceTab', { segment });

  };



  return (

    <View style={styles.container}>

      <Pressable

        accessibilityRole="tab"

        accessibilityState={{ selected: activeTab === 'home' }}

        onPress={() => switchTab('home')}

        style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}

      >

        <AppText

          variant="bodyMedium"

          style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}

        >

          Home

        </AppText>

        {activeTab === 'home' ? <View style={styles.tabIndicator} /> : null}

      </Pressable>



      <Pressable

        accessibilityRole="tab"

        accessibilityState={{ selected: activeTab === 'category' }}

        onPress={() => switchTab('category')}

        style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}

      >

        <AppText

          variant="bodyMedium"

          style={[styles.tabLabel, activeTab === 'category' && styles.tabLabelActive]}

        >

          Category

        </AppText>

        {activeTab === 'category' ? <View style={styles.tabIndicator} /> : null}

      </Pressable>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    flexDirection: 'row',

    justifyContent: 'center',

    gap: spacing.xxl,

    paddingHorizontal: screenPaddingHorizontal,

    paddingBottom: spacing.sm,

    backgroundColor: colors.background,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: colors.borderStrong,

  },

  tabButton: {

    alignItems: 'center',

    paddingTop: spacing.sm,

    paddingBottom: spacing.sm,

    minWidth: 88,

    gap: spacing.sm,

  },

  tabLabel: {

    color: colors.textMuted,

    fontWeight: '600',

  },

  tabLabelActive: {

    color: colors.primary,

    fontWeight: '700',

  },

  tabIndicator: {

    height: 3,

    width: '100%',

    borderRadius: 999,

    backgroundColor: colors.primary,

  },

  pressed: {

    opacity: 0.88,

  },

});


