import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../../design-system';

export function OrderSuccessHeroArt() {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={72} color={colors.successSoft} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  circle: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
