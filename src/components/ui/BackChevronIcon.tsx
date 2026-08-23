import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export interface BackChevronIconProps {
  color: string;
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function BackChevronIcon({
  color,
  size = 12,
  strokeWidth = 2,
  style,
}: BackChevronIconProps) {
  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderLeftWidth: strokeWidth,
          borderBottomWidth: strokeWidth,
          borderColor: color,
          marginLeft: size * 0.15,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    transform: [{ rotate: '45deg' }],
  },
});
