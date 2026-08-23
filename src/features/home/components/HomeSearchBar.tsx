import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { homeColors, homeRadii, homeShadows, homeSpacing } from '../theme/homeTheme';

interface HomeSearchBarProps {
  onPress: () => void;
}

export function HomeSearchBar({ onPress }: HomeSearchBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 10 }]}>
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
        onPress={onPress}
      >
        <Text style={styles.icon}>⌕</Text>
        <Text style={styles.placeholder}>Search products</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: homeSpacing.screen,
    paddingBottom: 4,
    backgroundColor: homeColors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: homeRadii.pill,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    ...homeShadows.search,
  },
  containerPressed: {
    opacity: 0.94,
    borderColor: homeColors.border,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: homeColors.textSubtle,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: homeColors.textSubtle,
  },
});
