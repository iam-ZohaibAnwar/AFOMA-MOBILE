import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../../design-system';

export type AdminProductDetailRowLayout = 'inline' | 'stacked' | 'auto';

export interface AdminProductDetailRowProps {
  label: string;
  value: string;
  multiline?: boolean;
  isLink?: boolean;
  layout?: AdminProductDetailRowLayout;
}

const INLINE_VALUE_MAX_LENGTH = 56;
const INLINE_LABEL_MAX_LENGTH = 22;

function resolveRowLayout({
  layout = 'auto',
  label,
  multiline = false,
  isLink = false,
  value,
}: {
  layout?: AdminProductDetailRowLayout;
  label: string;
  multiline?: boolean;
  isLink?: boolean;
  value: string;
}): 'inline' | 'stacked' {
  if (layout === 'inline' || layout === 'stacked') {
    return layout;
  }

  if (
    multiline ||
    isLink ||
    value.includes('\n') ||
    value.length > INLINE_VALUE_MAX_LENGTH ||
    label.length > INLINE_LABEL_MAX_LENGTH
  ) {
    return 'stacked';
  }

  return 'inline';
}

export function AdminProductDetailRow({
  label,
  value,
  multiline = false,
  isLink = false,
  layout = 'auto',
}: AdminProductDetailRowProps) {
  const resolvedLayout = resolveRowLayout({ layout, label, multiline, isLink, value });
  const isInline = resolvedLayout === 'inline';
  const canOpenLink = isLink && value.trim() && value !== '—';

  const valueNode = canOpenLink ? (
    <Pressable
      accessibilityRole="link"
      onPress={() => void Linking.openURL(value.trim())}
      style={({ pressed }) => [isInline ? styles.valueInlineWrap : null, pressed && styles.linkPressed]}
    >
      <AppText
        variant="bodySmall"
        color="textLink"
        style={[styles.linkValue, isInline && styles.valueInlineText]}
        numberOfLines={multiline ? undefined : isInline ? 2 : 4}
      >
        {value}
      </AppText>
    </Pressable>
  ) : (
    <AppText
      variant="bodySmall"
      style={[
        styles.value,
        multiline && styles.valueMultiline,
        isInline && styles.valueInlineText,
      ]}
      numberOfLines={multiline ? undefined : isInline ? 2 : 6}
    >
      {value}
    </AppText>
  );

  return (
    <View style={[styles.row, isInline && styles.rowInline]}>
      <AppText
        variant="bodySmall"
        color="textSecondary"
        style={[styles.label, isInline && styles.labelInline]}
      >
        {label}
      </AppText>
      {isInline ? <View style={styles.valueInlineWrap}>{valueNode}</View> : valueNode}
    </View>
  );
}

export function AdminProductDetailFieldList({
  fields,
}: {
  fields: Array<{
    label: string;
    value: string;
    multiline?: boolean;
    isLink?: boolean;
    layout?: AdminProductDetailRowLayout;
  }>;
}) {
  return (
    <View style={styles.fieldList}>
      {fields.map((field) => (
        <AdminProductDetailRow
          key={field.label}
          label={field.label}
          value={field.value}
          multiline={field.multiline}
          isLink={field.isLink}
          layout={field.layout}
        />
      ))}
    </View>
  );
}

export function AdminProductDetailChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <AppText variant="caption" style={styles.chipText} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldList: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.xs,
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '600',
    lineHeight: 20,
  },
  labelInline: {
    flex: 1,
    flexShrink: 0,
    maxWidth: '52%',
    lineHeight: 20,
  },
  value: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
  valueMultiline: {
    lineHeight: 22,
  },
  valueInlineWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
  },
  valueInlineText: {
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 20,
  },
  linkValue: {
    lineHeight: 20,
  },
  linkPressed: {
    opacity: 0.85,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
