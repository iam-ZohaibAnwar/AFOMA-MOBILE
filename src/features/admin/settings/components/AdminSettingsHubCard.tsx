import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronForwardIcon } from '../../../../components/ui/ChevronForwardIcon';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { AdminProductStatusChip } from '../../product-management/components/AdminProductStatusChip';

export interface AdminSettingsHubCardMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
}

export interface AdminSettingsHubCardProps {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  meta?: AdminSettingsHubCardMeta | null;
  onPress: () => void;
}

export function AdminSettingsHubCard({
  title,
  description,
  icon,
  accentColor = colors.primary,
  meta,
  onPress,
}: AdminSettingsHubCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
          <Ionicons name={icon} size={22} color={colors.textInverse} />
        </View>

        <View style={styles.copy}>
          <AppText variant="bodyMedium" style={styles.title} numberOfLines={2}>
            {title}
          </AppText>

          {description ? (
            <AppText variant="caption" color="textSecondary" numberOfLines={2}>
              {description}
            </AppText>
          ) : null}

          {meta ? (
            <View style={styles.metaRow}>
              <AdminProductStatusChip label={meta.label} icon={meta.icon} tone={meta.tone} />
            </View>
          ) : null}
        </View>

        <View style={styles.chevronWrap}>
          <ChevronForwardIcon color={colors.textMuted} size={18} />
        </View>
      </Pressable>
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
  pressed: {
    opacity: 0.92,
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
  chevronWrap: {
    marginTop: spacing.lg,
  },
});
