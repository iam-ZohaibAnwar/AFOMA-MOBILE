import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import { motion } from '../../../design-system/motion';

const MESSAGES = [
  'Finding the best routes…',
  'Checking carrier rates…',
  'Packaging your delivery options…',
  'Almost there…',
];

const TRACK_WIDTH = 168;

interface ShippingRatesLoadingProps {
  style?: StyleProp<ViewStyle>;
  /** Compact row for order summary total. */
  compact?: boolean;
  /** Minimal inline loader for footer totals. */
  inline?: boolean;
  /** Optional one-line status copy (panel only by default). */
  showMessage?: boolean;
}

function LoadingDots() {
  const dotScales = useRef([0, 1, 2].map(() => new Animated.Value(0.55))).current;

  useEffect(() => {
    const loops = dotScales.map((scale, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(scale, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.55,
            duration: 320,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dotScales]);

  return (
    <View style={styles.dotsRow}>
      {dotScales.map((scale, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              transform: [{ scale }],
              opacity: scale.interpolate({
                inputRange: [0.55, 1],
                outputRange: [0.45, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

function useRotatingMessage(intervalMs = 2200) {
  const [messageIndex, setMessageIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: motion.contentFadeMs / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.contentFadeMs / 2,
          useNativeDriver: true,
        }),
      ]).start();

      setMessageIndex((current) => (current + 1) % MESSAGES.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, opacity]);

  return { message: MESSAGES[messageIndex], opacity };
}

function ShippingTrack({ compact = false }: { compact?: boolean }) {
  const truckX = useRef(new Animated.Value(0)).current;
  const truckBob = useRef(new Animated.Value(0)).current;
  const packagePulse = useRef(new Animated.Value(1)).current;
  const trailOpacity = useRef(new Animated.Value(0.25)).current;

  const trackWidth = compact ? 96 : TRACK_WIDTH;
  const travel = trackWidth - (compact ? 34 : 44);

  useEffect(() => {
    const driveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(truckX, {
          toValue: travel,
          duration: compact ? 1400 : 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(truckX, {
          toValue: 0,
          duration: compact ? 1400 : 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(truckBob, {
          toValue: -2,
          duration: 420,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(truckBob, {
          toValue: 0,
          duration: 420,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const packageLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(packagePulse, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(packagePulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const trailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(trailOpacity, {
          toValue: 0.75,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(trailOpacity, {
          toValue: 0.2,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    driveLoop.start();
    bobLoop.start();
    packageLoop.start();
    trailLoop.start();

    return () => {
      driveLoop.stop();
      bobLoop.stop();
      packageLoop.stop();
      trailLoop.stop();
    };
  }, [compact, packagePulse, trailOpacity, travel, truckBob, truckX]);

  return (
    <View style={[styles.track, compact && styles.trackCompact, { width: trackWidth }]}>
      <Animated.View style={[styles.trail, compact && styles.trailCompact, { opacity: trailOpacity }]} />

      <Animated.View style={[styles.packageIcon, { transform: [{ scale: packagePulse }] }]}>
        <Ionicons
          name="cube-outline"
          size={compact ? 14 : 18}
          color={colors.primary}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.truckWrap,
          compact && styles.truckWrapCompact,
          {
            transform: [{ translateX: truckX }, { translateY: truckBob }],
          },
        ]}
      >
        <View style={[styles.truckBadge, compact && styles.truckBadgeCompact]}>
          <Ionicons
            name="car-outline"
            size={compact ? 13 : 16}
            color={colors.textInverse}
          />
        </View>
      </Animated.View>

      <View style={styles.destinationDot} />
    </View>
  );
}

/** Animated shipping-rate loader — panel, compact value, or header badge. */
export function ShippingRatesLoading({
  style,
  compact = false,
  inline = false,
  showMessage,
}: ShippingRatesLoadingProps) {
  const shouldShowMessage = showMessage ?? (!compact && !inline);
  const { message, opacity } = useRotatingMessage(2200);

  if (inline || compact) {
    return (
      <View
        style={[styles.singleLineWrap, inline && styles.inlineWrap, style]}
        accessibilityRole="progressbar"
        accessibilityLabel="Calculating total"
      >
        <ShippingTrack compact />
        <LoadingDots />
      </View>
    );
  }

  return (
    <View
      style={[styles.panel, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Calculating shipping rates"
    >
      <ShippingTrack />
      {shouldShowMessage ? (
        <Animated.View style={[styles.messageWrap, { opacity }]}>
          <AppText variant="caption" color="textSecondary" style={styles.message} numberOfLines={1}>
            {message}
          </AppText>
        </Animated.View>
      ) : null}
      <LoadingDots />
    </View>
  );
}

/** Tiny loader for the shipping card header while rates fetch. */
export function ShippingRatesLoadingBadge() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.badge} accessibilityLabel="Calculating shipping">
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons name="sync-outline" size={14} color={colors.primary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  singleLineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  inlineWrap: {
    maxWidth: '70%',
  },
  track: {
    height: 34,
    justifyContent: 'center',
  },
  trackCompact: {
    height: 24,
    alignSelf: 'flex-end',
  },
  trail: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  trailCompact: {
    left: 8,
    right: 8,
    height: 2,
  },
  packageIcon: {
    position: 'absolute',
    left: 0,
    top: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  truckWrap: {
    position: 'absolute',
    left: 0,
    top: 4,
  },
  truckWrapCompact: {
    top: 2,
  },
  truckBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  truckBadgeCompact: {
    width: 22,
    height: 22,
  },
  destinationDot: {
    position: 'absolute',
    right: 0,
    top: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  messageWrap: {
    minHeight: 18,
  },
  message: {
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
