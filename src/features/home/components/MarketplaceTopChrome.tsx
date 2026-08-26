import { StyleSheet, View } from 'react-native';

import { MarketplaceHeader } from './MarketplaceHeader';
import { colors } from '../../../design-system';

export interface MarketplaceTopChromeProps {
  onMenuPress: () => void;
  onSearchPress: () => void;
}

export function MarketplaceTopChrome({ onMenuPress, onSearchPress }: MarketplaceTopChromeProps) {
  return (
    <View style={styles.container}>
      <MarketplaceHeader onMenuPress={onMenuPress} onSearchPress={onSearchPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
