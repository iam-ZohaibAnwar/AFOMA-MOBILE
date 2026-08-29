import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import type { SellerProfile, SellerSetupSectionDefinition } from '../../types/sellerProfile';
import { isSellerProfileSectionComplete } from '../utils/sellerProfileDisplay';

export interface SellerShopProfileSectionCardProps {
  section: SellerSetupSectionDefinition;
  icon: keyof typeof Ionicons.glyphMap;
  profile?: SellerProfile | null;
  onPress: () => void;
}

export function SellerShopProfileSectionCard({
  section,
  icon,
  profile,
  onPress,
}: SellerShopProfileSectionCardProps) {
  const complete = isSellerProfileSectionComplete(section.id, profile);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={section.title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.label}>
          {section.title}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {section.description}
        </AppText>
        <View style={[styles.badge, complete ? styles.badgeComplete : styles.badgeIncomplete]}>
          <AppText variant="caption" style={complete ? styles.badgeTextComplete : styles.badgeTextIncomplete}>
            {complete ? 'Complete' : 'Incomplete'}
          </AppText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  label: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeComplete: {
    backgroundColor: colors.successSoft,
  },
  badgeIncomplete: {
    backgroundColor: colors.surfaceMuted,
  },
  badgeTextComplete: {
    color: colors.success,
    fontWeight: '600',
  },
  badgeTextIncomplete: {
    color: colors.textMuted,
    fontWeight: '600',
  },
});
