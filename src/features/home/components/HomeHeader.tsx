import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartBadge } from '../../../components/ecommerce';
import { AfomaLogo } from '../../../components/brand';
import { AppText } from '../../../components/ui/AppText';
import { colors, layout, radius, shadows, screenPaddingHorizontal, spacing } from '../../../design-system';

interface HomeTopBarProps {
  cartCount: number;
  onCartPress: () => void;
  onSearchPress: () => void;
}

export function HomeTopBar({ cartCount, onCartPress, onSearchPress }: HomeTopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerRow}>
        <View style={styles.brandBlock}>
          <AfomaLogo width={132} />
          <AppText variant="caption" color="textMuted" style={styles.tagline}>
            Marketplace
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cart"
          onPress={onCartPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <CartBadge count={cartCount}>
            <AppText variant="bodyMedium" style={styles.iconGlyph}>
              🛒
            </AppText>
          </CartBadge>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search products"
        onPress={onSearchPress}
        style={({ pressed }) => [styles.searchField, pressed && styles.searchFieldPressed]}
      >
        <AppText variant="bodyMedium" color="textSubtle" style={styles.searchIcon}>
          ⌕
        </AppText>
        <AppText variant="body" color="textSubtle" style={styles.searchPlaceholder}>
          Search products...
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: colors.background,
    paddingHorizontal: screenPaddingHorizontal,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBlock: {
    gap: spacing.xs,
  },
  tagline: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  iconButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  iconButtonPressed: {
    opacity: 0.9,
  },
  iconGlyph: {
    fontSize: 18,
    lineHeight: 20,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  searchFieldPressed: {
    opacity: 0.94,
    borderColor: colors.primary,
  },
  searchIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchPlaceholder: {
    flex: 1,
  },
});
