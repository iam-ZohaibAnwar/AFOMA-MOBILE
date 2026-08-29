import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../../design-system';
import type { AdminSellerDetailSection, AdminSellerDetailSectionId } from '../../types/adminSellerManagement';

export interface AdminSellerDetailSectionsCardProps {
  sections: AdminSellerDetailSection[];
  onSectionPress: (sectionId: AdminSellerDetailSectionId) => void;
}

const SECTION_META: Record<
  AdminSellerDetailSectionId,
  { icon: keyof typeof Ionicons.glyphMap; description: string }
> = {
  'basic-information': {
    icon: 'person-outline',
    description: 'Name, email, phone, and gender',
  },
  address: {
    icon: 'location-outline',
    description: 'Country, city, and street address',
  },
  'shop-details': {
    icon: 'storefront-outline',
    description: 'Shop branding, logo, banner, and social links',
  },
  'payment-information': {
    icon: 'card-outline',
    description: 'Bank account, SWIFT, and IBAN details',
  },
  'shop-policies': {
    icon: 'document-text-outline',
    description: 'Returns, cancellation, and FAQs',
  },
};

function AdminSellerDetailSectionNavCard({
  section,
  onPress,
}: {
  section: AdminSellerDetailSection;
  onPress: () => void;
}) {
  const meta = SECTION_META[section.id];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={section.label}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={meta.icon} size={20} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="bodyMedium" style={styles.label}>
          {section.label}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {meta.description}
        </AppText>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function AdminSellerDetailSectionsCard({
  sections,
  onSectionPress,
}: AdminSellerDetailSectionsCardProps) {
  return (
    <View style={styles.list}>
      {sections.map((section) => (
        <AdminSellerDetailSectionNavCard
          key={section.id}
          section={section}
          onPress={() => onSectionPress(section.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
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
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
