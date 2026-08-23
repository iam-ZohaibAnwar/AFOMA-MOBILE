import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../../design-system';

type AppCardVariant = 'elevated' | 'flat' | 'muted';

export interface AppCardProps extends ViewProps {
  variant?: AppCardVariant;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({
  variant = 'elevated',
  padded = true,
  style,
  children,
  ...viewProps
}: AppCardProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`variant_${variant}`],
        padded && styles.padded,
        style,
      ]}
      {...viewProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.large,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  variant_elevated: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  variant_flat: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_muted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
