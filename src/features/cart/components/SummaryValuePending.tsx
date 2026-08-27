import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../../design-system';

export interface SummaryValuePendingProps {
  delayMs?: number;
  emphasized?: boolean;
}

function PendingBar({
  delayMs,
  barHeight,
}: {
  delayMs: number;
  barHeight: number;
}) {
  const scaleY = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(scaleY, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          toValue: 0.35,
          duration: 420,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [delayMs, scaleY]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: barHeight,
          transform: [{ scaleY }],
        },
      ]}
    />
  );
}

/** Animated price placeholder while shipping totals are loading. */
export function SummaryValuePending({
  delayMs = 0,
  emphasized = false,
}: SummaryValuePendingProps) {
  const barHeight = emphasized ? 16 : 12;

  return (
    <View
      style={[styles.wrap, emphasized && styles.wrapEmphasized]}
      accessibilityRole="progressbar"
      accessibilityLabel="Calculating total"
    >
      {[0, 1, 2].map((index) => (
        <PendingBar key={index} delayMs={delayMs + index * 110} barHeight={barHeight} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 44,
    minHeight: 22,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31, 98, 142, 0.14)',
  },
  wrapEmphasized: {
    minWidth: 52,
    minHeight: 26,
    paddingHorizontal: spacing.md,
  },
  bar: {
    width: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
