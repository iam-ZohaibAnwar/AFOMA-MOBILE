import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { motion } from '../../design-system/motion';

export interface FadeInContentProps {
  children: ReactNode;
  visible?: boolean;
  delayMs?: number;
  durationMs?: number;
  translateY?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeInContent({
  children,
  visible = true,
  delayMs = 0,
  durationMs = motion.contentFadeMs,
  translateY = 8,
  style,
}: FadeInContentProps) {
  const opacity = useRef(new Animated.Value(visible ? 0 : 0)).current;
  const offsetY = useRef(new Animated.Value(visible ? translateY : 0)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      offsetY.setValue(translateY);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: durationMs,
        delay: delayMs,
        useNativeDriver: true,
      }),
      Animated.timing(offsetY, {
        toValue: 0,
        duration: durationMs,
        delay: delayMs,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delayMs, durationMs, offsetY, opacity, translateY, visible]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY: offsetY }] }, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
