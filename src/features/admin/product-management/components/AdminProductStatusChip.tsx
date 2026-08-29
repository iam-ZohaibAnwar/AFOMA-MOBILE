import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export type AdminProductStatusChipTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export interface AdminProductStatusChipProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: AdminProductStatusChipTone;
}

const TONE_STYLES: Record<
  AdminProductStatusChipTone,
  { backgroundColor: string; color: string }
> = {
  success: {
    backgroundColor: colors.successBg,
    color: colors.success,
  },
  info: {
    backgroundColor: colors.primarySoft,
    color: colors.primary,
  },
  warning: {
    backgroundColor: '#FEF3C7',
    color: colors.warningText,
  },
  danger: {
    backgroundColor: colors.errorBg,
    color: colors.error,
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },
};

export function AdminProductStatusChip({ label, icon, tone }: AdminProductStatusChipProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View style={[styles.chip, { backgroundColor: toneStyle.backgroundColor }]}>
      <Ionicons name={icon} size={12} color={toneStyle.color} />
      <AppText variant="caption" style={[styles.label, { color: toneStyle.color }]} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  label: {
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
});
