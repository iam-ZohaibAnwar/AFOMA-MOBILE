import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion } from '../../design-system/motion';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  scaleTo = 0.97,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        Animated.timing(scale, {
          toValue: scaleTo,
          duration: motion.pressFeedbackMs,
          useNativeDriver: true,
        }).start();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        Animated.timing(scale, {
          toValue: 1,
          duration: motion.pressFeedbackMs,
          useNativeDriver: true,
        }).start();
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
