import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface SellerDashboardStatCardProps {
  label: string;
  value: string;
  suffix?: string;
  onPress?: () => void;
}

export function SellerDashboardStatCard({ label, value, suffix, onPress }: SellerDashboardStatCardProps) {
  const content = (
    <>
      <AppText variant="bodySmall" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="h2" style={styles.value}>
        {value}
      </AppText>
      {suffix ? (
        <AppText variant="caption" color="textMuted">
          {suffix}
        </AppText>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.secondaryMuted,
    borderRadius: radius.large,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  label: {
    fontWeight: '600',
  },
  value: {
    color: colors.primary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.94,
  },
});
