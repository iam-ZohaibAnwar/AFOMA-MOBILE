import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

import { colors, radius } from '../../../design-system';
import {
  getCartTabCenter,
  notifyCartBadgeBump,
  subscribeFlyToCart,
  type FlyToCartPayload,
} from '../../../features/cart/utils/cartFeedback';

const FLY_SIZE = 52;
const FLY_DURATION_MS = 420;

function resolveFlyTarget(): { x: number; y: number } {
  const registered = getCartTabCenter();
  if (registered) {
    return registered;
  }

  const { width, height } = Dimensions.get('window');
  return {
    x: width * 0.625,
    y: height - 36,
  };
}

export function FlyToCartOverlay() {
  const [flight, setFlight] = useState<FlyToCartPayload | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const flightIdRef = useRef(0);

  useEffect(() => {
    return subscribeFlyToCart((payload) => {
      flightIdRef.current += 1;
      const currentId = flightIdRef.current;
      progress.setValue(0);
      setFlight(payload);

      Animated.timing(progress, {
        toValue: 1,
        duration: FLY_DURATION_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || currentId !== flightIdRef.current) {
          return;
        }
        notifyCartBadgeBump();
        setFlight(null);
      });
    });
  }, [progress]);

  if (!flight) {
    return null;
  }

  const target = resolveFlyTarget();
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [flight.fromX - FLY_SIZE / 2, target.x - FLY_SIZE / 2],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [
      flight.fromY - FLY_SIZE / 2,
      flight.fromY - FLY_SIZE * 1.6,
      target.y - FLY_SIZE / 2,
    ],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.82, 0.34],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.flyItem,
          {
            opacity,
            transform: [{ translateX }, { translateY }, { scale }],
          },
        ]}
      >
        {flight.imageUrl ? (
          <Image source={{ uri: flight.imageUrl }} style={styles.flyImage} resizeMode="cover" />
        ) : (
          <View style={styles.flyDot} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 120,
    elevation: 120,
  },
  flyItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: FLY_SIZE,
    height: FLY_SIZE,
    borderRadius: radius.medium,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  flyImage: {
    width: '100%',
    height: '100%',
  },
  flyDot: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
