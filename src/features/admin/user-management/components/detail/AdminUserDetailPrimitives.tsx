import type { ReactNode } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import {
  AdminProductDetailCardShell,
  AdminProductDetailMetricRow,
} from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminUserDetailField } from '../../utils/adminUserDetailDisplay';

type DetailIcon = keyof typeof Ionicons.glyphMap;

export function AdminUserDetailSection({
  title,
  icon,
  children,
  accent,
}: {
  title: string;
  icon: DetailIcon;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <AdminProductDetailCardShell
      title={title}
      icon={icon}
      iconVariant="solid"
      accent={accent}
    >
      {children}
    </AdminProductDetailCardShell>
  );
}

export function AdminUserDetailFieldList({ fields }: { fields: AdminUserDetailField[] }) {
  return (
    <>
      {fields.map((field) => (
        <AdminProductDetailMetricRow key={field.label} label={field.label} value={field.value} />
      ))}
    </>
  );
}
