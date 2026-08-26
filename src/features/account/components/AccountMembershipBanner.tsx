import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../design-system';
import { AccountMenuIcon } from './AccountMenuIcon';

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
      <View style={styles.iconWrap}>
        <AccountMenuIcon name="membership" color="#6D28D9" size={20} />
      </View>
      <View style={styles.textBlock}>
        <AppText variant="label" style={styles.title}>
          Gold member
        </AppText>
        <AppText variant="bodySmall" style={styles.subtitle}>
          240 points to next tier
        </AppText>
      </View>
      <ChevronForwardIcon color="#5B21B6" size={18} />
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
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
});
