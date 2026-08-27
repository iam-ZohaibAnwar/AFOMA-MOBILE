import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackSearchHeader } from '../../../components/ui/BackSearchHeader';
import { colors } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { navigateToSearch } from '../../../app/navigation/shoppingNavigation';

export interface CategoryBrowseScreenLayoutProps {
  navigation: NativeStackNavigationProp<ShoppingStackParamList>;
  children: ReactNode;
}

export function CategoryBrowseScreenLayout({
  navigation,
  children,
}: CategoryBrowseScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      <BackSearchHeader
        onBackPress={() => navigation.goBack()}
        onSearchPress={() => navigateToSearch(navigation)}
      />
      <View style={styles.content}>{children}</View>
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
