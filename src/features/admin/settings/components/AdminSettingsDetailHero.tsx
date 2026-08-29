import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';

export interface AdminSettingsDetailHeroProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  statusLabel?: string;
  statusIcon?: keyof typeof Ionicons.glyphMap;
}

export function AdminSettingsDetailHero({
  title,
  subtitle,
  icon,
  statusLabel,
  statusIcon = 'checkmark-circle-outline',
}: AdminSettingsDetailHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={colors.textInverse} />
      </View>

      <View style={styles.copy}>
        <AppText variant="h3" style={styles.title}>
          {title}
        </AppText>

        {subtitle ? (
          <AppText variant="bodySmall" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}

        {statusLabel ? (
          <View style={styles.chipsRow}>
            <AdminProductStatusChip label={statusLabel} icon={statusIcon} tone="info" />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: colors.primary,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
