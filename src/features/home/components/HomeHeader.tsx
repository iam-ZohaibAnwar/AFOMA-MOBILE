import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { homeColors, homeRadii, homeShadows, homeSpacing, homeTypography } from '../theme/homeTheme';

interface HomeHeaderProps {
  onCartPress: () => void;
  onAccountPress: () => void;
  accountLabel?: string;
}

function HeaderAction({
  label,
  onPress,
  emphasized = false,
}: {
  label: string;
  onPress: () => void;
  emphasized?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        emphasized && styles.actionButtonEmphasized,
        pressed && styles.actionButtonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.actionText, emphasized && styles.actionTextEmphasized]}>{label}</Text>
    </Pressable>
  );
}

export function HomeHeader({ onCartPress, onAccountPress, accountLabel = 'Account' }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.brandBlock}>
        <Text style={homeTypography.logo}>
          AFO<Text style={homeTypography.logoAccent}>MA</Text>
        </Text>
        <Text style={styles.tagline}>Marketplace</Text>
      </View>

      <View style={styles.actions}>
        <HeaderAction label="Cart" onPress={onCartPress} emphasized />
        <HeaderAction label={accountLabel} onPress={onAccountPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: homeSpacing.screen,
    paddingBottom: 14,
    backgroundColor: homeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.borderLight,
    ...homeShadows.header,
  },
  brandBlock: {
    gap: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: homeColors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: homeRadii.pill,
    backgroundColor: homeColors.surfaceMuted,
    borderWidth: 1,
    borderColor: homeColors.borderLight,
  },
  actionButtonEmphasized: {
    backgroundColor: homeColors.primary,
    borderColor: homeColors.primary,
  },
  actionButtonPressed: {
    opacity: 0.88,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: homeColors.text,
  },
  actionTextEmphasized: {
    color: homeColors.surface,
  },
});
