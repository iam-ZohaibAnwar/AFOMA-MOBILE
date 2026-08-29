import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '../../../../components/motion/PressableScale';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';

export interface AdminListingOptionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBackgroundColor?: string;
  selected?: boolean;
  onPress: () => void;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AdminListingOptionCard({
  title,
  description,
  icon,
  iconBackgroundColor = colors.primary,
  selected = false,
  onPress,
  trailing,
  style,
}: AdminListingOptionCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.card,
        selected && styles.cardSelected,
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>{icon}</View>
      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  trailing: {
    alignSelf: 'center',
  },
});
