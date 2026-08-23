import { Platform, type ViewStyle } from 'react-native';

import { colors } from './colors';

function createElevation(
  opacity: number,
  radius: number,
  height: number,
  elevation: number,
): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {},
  }) as ViewStyle;
}

/** Subtle card elevation — product tiles, category cards. */
export const shadows = {
  card: createElevation(0.06, 10, 2, 2),
  floating: createElevation(0.1, 16, 4, 6),
  modal: createElevation(0.14, 24, 8, 10),
} as const;

export type ShadowToken = keyof typeof shadows;
