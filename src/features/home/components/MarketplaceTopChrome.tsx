import { StyleSheet, View } from 'react-native';

import { MarketplaceHeader } from './MarketplaceHeader';
import { colors } from '../../../design-system';

export interface MarketplaceTopChromeProps {
  onProfilePress: () => void;
  onSearchPress: () => void;
}

export function MarketplaceTopChrome({ onProfilePress, onSearchPress }: MarketplaceTopChromeProps) {
  return (
    <View style={styles.container}>
      <MarketplaceHeader onProfilePress={onProfilePress} onSearchPress={onSearchPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
});
