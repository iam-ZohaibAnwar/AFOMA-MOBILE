import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '../../design-system';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'productCard';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  variant = 'rect',
  width = '100%',
  height,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  if (variant === 'productCard') {
    return (
      <View style={[styles.productCard, style]}>
        <Animated.View style={[styles.productImage, { opacity }]} />
        <View style={styles.productContent}>
          <Animated.View style={[styles.textLine, styles.textLineWide, { opacity }]} />
          <Animated.View style={[styles.textLine, styles.textLineNarrow, { opacity }]} />
          <Animated.View style={[styles.textLine, styles.textLinePrice, { opacity }]} />
        </View>
      </View>
    );
  }

  const resolvedHeight =
    height ??
    (variant === 'text' ? 14 : variant === 'circle' ? 48 : 120);

  const resolvedRadius =
    variant === 'circle' ? radius.pill : variant === 'text' ? radius.small : radius.medium;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.disabledBg,
  },
  productCard: {
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  productContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  textLine: {
    height: 12,
    borderRadius: radius.small,
    backgroundColor: colors.disabledBg,
  },
  textLineWide: {
    width: '100%',
  },
  textLineNarrow: {
    width: '72%',
  },
  textLinePrice: {
    width: '40%',
    height: 14,
    marginTop: spacing.xs,
  },
});
