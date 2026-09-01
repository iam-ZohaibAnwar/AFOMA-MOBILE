import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../../design-system';

export interface AdminProductDetailCardShellProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  accent?: boolean;
  /** Soft tint (default) or solid primary fill with white icon. */
  iconVariant?: 'soft' | 'solid';
}

export function AdminProductDetailCardShell({
  title,
  icon,
  children,
  accent = false,
  iconVariant = 'solid',
}: AdminProductDetailCardShellProps) {
  const iconBackgroundColor = iconVariant === 'solid' ? colors.primary : colors.primarySoft;
  const iconColor = iconVariant === 'solid' ? colors.textInverse : colors.primary;

  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      {accent ? <View style={styles.accentBar} /> : null}
      <View style={styles.cardBody}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: iconBackgroundColor }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <AppText variant="bodyMedium" style={styles.title}>
            {title}
          </AppText>
        </View>
        {children}
      </View>
    </View>
  );
}

export interface AdminProductDetailMetricRowProps {
  label: string;
  value: string;
  layout?: 'inline' | 'stacked';
}

export function AdminProductDetailMetricRow({
  label,
  value,
  layout = 'inline',
}: AdminProductDetailMetricRowProps) {
  const isStacked = layout === 'stacked';

  return (
    <View style={[styles.metricRow, isStacked && styles.metricRowStacked]}>
      <AppText
        variant="bodySmall"
        color="textSecondary"
        style={[styles.metricLabel, isStacked && styles.metricLabelStacked]}
      >
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        style={[styles.metricValue, isStacked && styles.metricValueStacked]}
        numberOfLines={isStacked ? undefined : 3}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardAccent: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
    zIndex: 1,
  },
  cardBody: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
    paddingLeft: spacing.lg + 4,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 2,
  },
  metricRowStacked: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  metricLabel: {
    flex: 1,
    flexShrink: 0,
    maxWidth: '52%',
    fontWeight: '600',
    lineHeight: 20,
  },
  metricLabelStacked: {
    flex: undefined,
    maxWidth: undefined,
  },
  metricValue: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 20,
  },
  metricValueStacked: {
    flex: undefined,
    textAlign: 'left',
    lineHeight: 22,
  },
});
