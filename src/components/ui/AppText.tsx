import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography, type TypographyToken } from '../../design-system';

export interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: keyof typeof colors | string;
}

export function AppText({
  variant = 'body',
  color,
  style,
  children,
  ...textProps
}: AppTextProps) {
  const resolvedColor =
    color && color in colors ? colors[color as keyof typeof colors] : color;

  return (
    <Text
      style={[
        typography[variant] as TextStyle,
        resolvedColor ? { color: resolvedColor } : null,
        style,
      ]}
      {...textProps}
    >
      {children}
    </Text>
  );
}
