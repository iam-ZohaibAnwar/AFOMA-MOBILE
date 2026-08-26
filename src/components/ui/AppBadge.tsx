import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '../../design-system';

type AppBadgeVariant = 'primary' | 'navy' | 'white' | 'success' | 'warning' | 'neutral';

export interface AppBadgeProps {
  label: string;
  variant?: AppBadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export function AppBadge({ label, variant = 'neutral', style }: AppBadgeProps) {
  return (
    <View style={[styles.base, styles[`variant_${variant}`], style]}>
      <Text style={[styles.label, styles[`label_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
  variant_primary: {
    backgroundColor: colors.primary,
  },
  label_primary: {
    color: colors.textInverse,
  },
  variant_navy: {
    backgroundColor: colors.textPrimary,
  },
  label_navy: {
    color: colors.textInverse,
  },
  variant_white: {
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.textPrimary,
  },
  label_white: {
    color: colors.textPrimary,
  },
  variant_success: {
    backgroundColor: colors.successSoft,
  },
  label_success: {
    color: colors.textPrimary,
  },
  variant_warning: {
    backgroundColor: colors.secondaryMuted,
  },
  label_warning: {
    color: colors.warningText,
  },
  variant_neutral: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label_neutral: {
    color: colors.textSecondary,
  },
});
