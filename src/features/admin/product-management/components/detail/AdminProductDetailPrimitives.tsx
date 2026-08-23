import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppDivider } from '../../../../../components/ui/AppDivider';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';

export interface AdminProductDetailRowProps {
  label: string;
  value: string;
  multiline?: boolean;
}

export function AdminProductDetailRow({ label, value, multiline = false }: AdminProductDetailRowProps) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <AppText
        variant="bodyMedium"
        style={[styles.value, multiline && styles.valueMultiline]}
        numberOfLines={multiline ? undefined : 4}
      >
        {value}
      </AppText>
    </View>
  );
}

export interface AdminProductDetailSectionProps {
  title: string;
  children: ReactNode;
}

export function AdminProductDetailSection({ title, children }: AdminProductDetailSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="label" color="textSecondary">
          {title}
        </AppText>
        <AppDivider />
      </View>
      {children}
    </View>
  );
}

export function AdminProductDetailFieldList({
  fields,
}: {
  fields: Array<{ label: string; value: string; multiline?: boolean }>;
}) {
  return (
    <>
      {fields.map((field) => (
        <AdminProductDetailRow
          key={field.label}
          label={field.label}
          value={field.value}
          multiline={field.multiline}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 1.2,
    textAlign: 'right',
  },
  valueMultiline: {
    textAlign: 'left',
  },
});
