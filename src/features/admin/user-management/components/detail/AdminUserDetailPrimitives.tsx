import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '../../../../../components/ui/AppCard';
import { AppText } from '../../../../../components/ui/AppText';
import { spacing } from '../../../../../design-system';
import type { AdminUserDetailField } from '../../utils/adminUserDetailDisplay';

function AdminUserDetailRow({ label, value }: AdminUserDetailField) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" style={styles.value} numberOfLines={4}>
        {value}
      </AppText>
    </View>
  );
}

export function AdminUserDetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <AppCard style={styles.section}>
      <AppText variant="label" color="textSecondary" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </AppCard>
  );
}

export function AdminUserDetailFieldList({ fields }: { fields: AdminUserDetailField[] }) {
  return (
    <View style={styles.fieldList}>
      {fields.map((field) => (
        <AdminUserDetailRow key={field.label} label={field.label} value={field.value} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  fieldList: {
    gap: spacing.xs,
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
});
