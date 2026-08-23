import { StyleSheet, View } from 'react-native';

import { MarketplaceHeader } from '../../home/components/MarketplaceHeader';
import {
  HomeCategoryTabs,
  type HomeCategoryTab,
} from '../../home/components/HomeCategoryTabs';
import { colors } from '../../../design-system';

export interface MarketplaceTopChromeProps {
  activeTab: HomeCategoryTab;
  onSearchPress: () => void;
}

export function MarketplaceTopChrome({ activeTab, onSearchPress }: MarketplaceTopChromeProps) {
  return (
    <View style={styles.container}>
      <MarketplaceHeader onSearchPress={onSearchPress} />
      <HomeCategoryTabs activeTab={activeTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
