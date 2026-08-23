import { AppBadge } from '../../../../components/ui/AppBadge';
import { formatAdminReviewStatus } from '../utils/adminReviewsContent';
import { adminReviewStatusBadgeVariant } from '../utils/adminReviewsDisplay';

export interface AdminReviewStatusBadgeProps {
  status?: string | null;
}

export function AdminReviewStatusBadge({ status }: AdminReviewStatusBadgeProps) {
  return (
    <AppBadge
      label={formatAdminReviewStatus(status)}
      variant={adminReviewStatusBadgeVariant(status)}
    />
  );
}
