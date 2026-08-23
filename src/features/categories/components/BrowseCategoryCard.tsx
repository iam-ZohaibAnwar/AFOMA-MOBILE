import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { BrowseCategoryCardImage } from './BrowseCategoryCardImage';

export interface BrowseCategoryCardProps {
  name: string;
  slug?: string;
  productCount?: number;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onViewAllPress?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function BrowseCategoryCard({
  name,
  slug,
  productCount,
  expanded = false,
  onToggleExpand,
  onViewAllPress,
  onPress,
  style,
}: BrowseCategoryCardProps) {
  const handleHeaderPress = onToggleExpand ?? onPress;

  return (
    <View style={[styles.card, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Browse ${name}`}
        accessibilityState={{ expanded }}
        onPress={handleHeaderPress}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressed]}
      >
        <BrowseCategoryCardImage slug={slug} name={name} />

        <View style={styles.content}>
          <AppText variant="h3" numberOfLines={2} style={styles.name}>
            {name}
          </AppText>
          {productCount !== undefined && productCount > 0 ? (
            <AppText variant="bodySmall" color="textMuted">
              {productCount} products
            </AppText>
          ) : null}
        </View>

        <AppText
          variant="bodyMedium"
          color="textMuted"
          style={[styles.chevron, expanded && styles.chevronExpanded]}
        >
          ›
        </AppText>
      </Pressable>

      {onViewAllPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View all ${name} products`}
          onPress={onViewAllPress}
          style={({ pressed }) => [styles.viewAllRow, pressed && styles.pressed]}
        >
          <AppText variant="bodyMedium" style={styles.viewAllText}>
            View all {name} →
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 112,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
  },
  viewAllRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    lineHeight: 28,
    paddingHorizontal: spacing.xs,
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  pressed: {
    opacity: 0.94,
  },
});
