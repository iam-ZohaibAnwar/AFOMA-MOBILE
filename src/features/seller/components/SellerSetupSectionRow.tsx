import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerProfile, SellerSetupSectionDefinition } from '../types/sellerProfile';
import { isSetupSectionComplete } from '../utils/sellerSetupSections';
import type { SellerProfileSetup } from '../types/sellerProfile';

export interface SellerSetupSectionRowProps {
  section: SellerSetupSectionDefinition;
  profileSetup?: SellerProfileSetup;
  profile?: SellerProfile | null;
  mode?: 'setup' | 'profile';
  onPress: () => void;
}

export function SellerSetupSectionRow({
  section,
  profileSetup,
  profile,
  mode = 'setup',
  onPress,
}: SellerSetupSectionRowProps) {
  const complete = isSetupSectionComplete(section.id, profileSetup, profile);
  const isProfileMode = mode === 'profile';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {!isProfileMode ? (
        <View style={[styles.statusDot, complete ? styles.statusComplete : styles.statusIncomplete]} />
      ) : null}
      <View style={styles.content}>
        <AppText variant="bodyMedium" style={styles.title}>
          {section.title}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {section.description}
        </AppText>
      </View>
      {isProfileMode ? (
        <AppText variant="bodySmall" color="textMuted">
          ›
        </AppText>
      ) : (
        <AppText variant="bodySmall" color={complete ? 'success' : 'textMuted'}>
          {complete ? 'Done' : 'Incomplete'}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  pressed: {
    opacity: 0.88,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusComplete: {
    backgroundColor: colors.success,
  },
  statusIncomplete: {
    backgroundColor: colors.borderStrong,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
