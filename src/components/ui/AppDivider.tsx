import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '../../design-system';

export interface AppDividerProps {
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppDivider({ inset = false, style }: AppDividerProps) {
  return <View style={[styles.divider, inset && styles.inset, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
  inset: {
    marginHorizontal: spacing.lg,
  },
});
