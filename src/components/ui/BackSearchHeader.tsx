import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SEARCH_PRODUCTS_PLACEHOLDER } from '../../constants/searchDefaults';
import { AppText } from './AppText';
import { HeaderBackButton } from './HeaderBackButton';
import { colors, layout, radius, screenPaddingHorizontal, shadows, spacing } from '../../design-system';

export interface BackSearchHeaderProps {
  placeholder?: string;
  onSearchPress: () => void;
  onBackPress: () => void;
}

export function BackSearchHeader({
  placeholder = SEARCH_PRODUCTS_PLACEHOLDER,
  onSearchPress,
  onBackPress,
}: BackSearchHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <HeaderBackButton onPress={onBackPress} />

      <Pressable
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        onPress={onSearchPress}
        style={({ pressed }) => [styles.searchField, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" color="textMuted" style={styles.searchIcon}>
          ⌕
        </AppText>
        <AppText variant="body" color="textSubtle" style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  searchIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.94,
  },
});
