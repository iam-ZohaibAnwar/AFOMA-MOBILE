import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';

interface OrderDetailSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}

export function OrderDetailSection({ title, icon, children }: OrderDetailSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.textInverse} />
        </View>
        <AppText variant="bodyMedium" style={styles.title}>
          {title}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
