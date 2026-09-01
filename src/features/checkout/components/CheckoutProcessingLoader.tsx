import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import {
  getCheckoutConfirmingMessages,
  type CheckoutConfirmingVariant,
} from '../utils/checkoutLoadingCopy';

interface CheckoutProcessingLoaderProps {
  message?: string;
  /** When true, dims content underneath (e.g. on checkout form). */
  overlay?: boolean;
  variant?: CheckoutConfirmingVariant;
}

const PROCESSING_TITLE = 'Processing your payment';

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

function useRotatingMessage(messages: string[], intervalMs = 2400) {
  const [messageIndex, setMessageIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    setMessageIndex(0);
    opacity.setValue(1);
  }, [messages, opacity]);

  useEffect(() => {
    if (messages.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setMessageIndex((current) => (current + 1) % messages.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, messages.length, opacity]);

  return { message: messages[messageIndex] ?? messages[0], opacity };
}

function ProcessingCard({
  message,
  variant = 'default',
}: {
  message?: string;
  variant?: CheckoutConfirmingVariant;
}) {
  const messages = message ? [message] : getCheckoutConfirmingMessages(variant);
  const { message: rotatingMessage, opacity } = useRotatingMessage(messages);

  const iconName =
    variant === 'paypal' ? 'logo-paypal' : variant === 'stripe' ? 'card-outline' : 'shield-checkmark-outline';

  return (
    <View style={styles.card} accessibilityRole="progressbar">
      <View style={styles.iconBadge}>
        <Ionicons name={iconName} size={28} color={colors.primary} />
      </View>
      <AppText variant="h3" style={styles.title}>
        {PROCESSING_TITLE}
      </AppText>
      <Animated.View style={{ opacity }}>
        <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {rotatingMessage}
        </AppText>
      </Animated.View>
      <LoadingDots />
      <View style={styles.secureRow}>
        <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
        <AppText variant="caption" color="textMuted">
          Secure checkout
        </AppText>
      </View>
    </View>
  );
}

export function CheckoutProcessingLoader({
  message,
  overlay = false,
  variant = 'default',
}: CheckoutProcessingLoaderProps) {
  if (overlay) {
    return (
      <View style={styles.overlay} pointerEvents="auto">
        <ProcessingCard message={message} variant={variant} />
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <ProcessingCard message={message} variant={variant} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    zIndex: 20,
    elevation: 20,
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.floating,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    minHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
