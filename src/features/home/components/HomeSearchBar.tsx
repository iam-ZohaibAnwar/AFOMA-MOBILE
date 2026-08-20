import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homeColors, homeRadii, homeShadows, homeSpacing } from '../theme/homeTheme';

interface HomeSearchBarProps {
  onPress: () => void;
}

export function HomeSearchBar({ onPress }: HomeSearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
        onPress={onPress}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>⌕</Text>
        </View>
        <Text style={styles.placeholder}>Search products, artisans, and categories</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: homeSpacing.screen,
    marginTop: homeSpacing.block,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: homeRadii.md,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
    ...homeShadows.search,
  },
  containerPressed: {
    opacity: 0.94,
    borderColor: homeColors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: homeRadii.sm,
    backgroundColor: homeColors.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: homeColors.primary,
    marginTop: -1,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    color: homeColors.textSubtle,
  },
});
