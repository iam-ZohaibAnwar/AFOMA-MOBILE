import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../../admin/product-management/components/AdminProductStatusChip';
import type { AdminSettingsHubCardMeta } from '../../../admin/settings/components/AdminSettingsHubCard';

export interface SellerSettingsOptionCardProps {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  meta?: AdminSettingsHubCardMeta | null;
  trailing?: ReactNode;
  footer?: ReactNode;
}

export function SellerSettingsOptionCard({
  title,
  description,
  icon,
  accentColor = colors.primary,
  meta,
  trailing,
  footer,
}: SellerSettingsOptionCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name={icon} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>

          {description ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={3}>
              {description}
            </AppText>
          ) : null}

          {meta ? (
            <View style={styles.metaRow}>
              <AdminProductStatusChip label={meta.label} icon={meta.icon} tone={meta.tone} />
            </View>
          ) : null}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingRight: spacing.md,
    paddingLeft: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: spacing.xs,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.sm,
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    flexShrink: 0,
  },
});
