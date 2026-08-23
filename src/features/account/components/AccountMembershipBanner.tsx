import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../design-system';

export interface AccountMembershipBannerProps {
  onPress?: () => void;
}

export function AccountMembershipBanner({ onPress }: AccountMembershipBannerProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.banner, pressed && onPress && styles.pressed]}
    >
      <AppText variant="bodyMedium" style={styles.icon}>
        🏅
      </AppText>
      <View style={styles.textBlock}>
        <AppText variant="label" style={styles.title}>
          Gold member
        </AppText>
        <AppText variant="bodySmall" style={styles.subtitle}>
          240 points to next tier
        </AppText>
      </View>
      <AppText variant="bodyMedium" style={styles.chevron}>
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#EDE9FE',
    borderRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.92,
  },
  icon: {
    fontSize: 22,
    lineHeight: 26,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#5B21B6',
  },
  subtitle: {
    color: '#6D28D9',
  },
  chevron: {
    color: '#5B21B6',
    fontSize: 22,
    lineHeight: 24,
  },
});
