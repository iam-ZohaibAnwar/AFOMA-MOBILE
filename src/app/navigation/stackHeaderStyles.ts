import { Platform, type TextStyle } from 'react-native';

import { colors, typography } from '../../design-system';

/** Shared stack header title/back-label typography (matches native header titles). */
export const stackHeaderTitleStyle: TextStyle = Platform.select({
  ios: {
    fontFamily: typography.h3.fontFamily,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  default: {
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.textPrimary,
  },
}) ?? {
  fontFamily: typography.h3.fontFamily,
  fontSize: typography.h3.fontSize,
  fontWeight: typography.h3.fontWeight,
  color: colors.textPrimary,
};
