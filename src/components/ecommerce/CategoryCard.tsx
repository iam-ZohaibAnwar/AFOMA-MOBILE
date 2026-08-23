import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, layout, radius, shadows, spacing } from '../../design-system';

type CategoryCardVariant = 'grid' | 'horizontal';

export interface CategoryCardProps {
  name: string;
  onPress: () => void;
  imageUrl?: string;
  width?: number;
  variant?: CategoryCardVariant;
  style?: StyleProp<ViewStyle>;
}

function getCategoryInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function CategoryCard({
  name,
  onPress,
  imageUrl,
  width,
  variant = 'grid',
  style,
}: CategoryCardProps) {
  const isHorizontal = variant === 'horizontal';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Browse ${name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isHorizontal ? styles.cardHorizontal : styles.cardGrid,
        width ? { width } : null,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.iconWrap, isHorizontal && styles.iconWrapHorizontal]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <AppText variant="h3" color="primary" style={styles.initial}>
            {getCategoryInitial(name)}
          </AppText>
        )}
      </View>
      <AppText
        variant="label"
        numberOfLines={2}
        style={[styles.name, isHorizontal && styles.nameHorizontal]}
      >
        {name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  cardGrid: {
    minHeight: 132,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  cardHorizontal: {
    minHeight: 120,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapHorizontal: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontSize: 22,
    lineHeight: 26,
  },
  name: {
    textAlign: 'center',
    minHeight: layout.minTouchTarget / 2,
  },
  nameHorizontal: {
    fontSize: 13,
    minHeight: 34,
  },
});
