import { AdminProductDetailCardShell, AdminProductDetailMetricRow } from '../../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminUserListItem } from '../../types/adminUserManagement';
import {
  getAdminUserAccountFields,
  getAdminUserPermissionsFields,
} from '../../utils/adminUserDetailDisplay';
import { formatAdminUserRoleLabel } from '../../utils/adminUserRoleOptions';

function findFieldValue(fields: Array<{ label: string; value: string }>, label: string): string {
  return fields.find((field) => field.label === label)?.value ?? '—';
}

export function AdminUserDetailInfoCard({ user }: { user: AdminUserListItem }) {
  const accountFields = getAdminUserAccountFields(user);
  const permissionsFields = getAdminUserPermissionsFields(user);

  const phone = findFieldValue(accountFields, 'Phone');
  const dob = findFieldValue(accountFields, 'Date of birth');
  const gender = findFieldValue(accountFields, 'Gender');
  const firstName = findFieldValue(accountFields, 'First name');
  const lastName = findFieldValue(accountFields, 'Last name');

  return (
    <AdminProductDetailCardShell title="User Information" icon="information-circle-outline" iconVariant="solid">
      <AdminProductDetailMetricRow label="First name" value={firstName} />
      <AdminProductDetailMetricRow label="Last name" value={lastName} />
      <AdminProductDetailMetricRow label="Email" value={user.email?.trim() || '—'} />
      <AdminProductDetailMetricRow label="Phone" value={phone} />
      <AdminProductDetailMetricRow label="Role" value={formatAdminUserRoleLabel(user.userRole)} />
      {permissionsFields ? (
        <AdminProductDetailMetricRow
          label="Full access"
          value={permissionsFields[0]?.value ?? '—'}
        />
      ) : null}
      {dob !== '—' ? <AdminProductDetailMetricRow label="Date of birth" value={dob} /> : null}
      {gender !== '—' ? <AdminProductDetailMetricRow label="Gender" value={gender} /> : null}
    </AdminProductDetailCardShell>
  );
}
