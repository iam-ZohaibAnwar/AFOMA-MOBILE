import type { AdminUserCounts } from '../types/adminDashboard';
import { adminDashboardTheme } from './adminDashboardTheme';

export interface AdminEngagementSegment {
  key: 'users' | 'sellers' | 'affiliates';
  label: string;
  value: number;
  color: string;
}

function parseCount(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

/** Registration mix — colors and labels match web `ChartPieAdmin`. */
export function buildEngagementSegments(
  userCounts: AdminUserCounts | null | undefined,
): AdminEngagementSegment[] {
  return [
    {
      key: 'users',
      label: 'Registered Users',
      value: parseCount(userCounts?.userCount),
      color: adminDashboardTheme.engagementUserColor,
    },
    {
      key: 'sellers',
      label: 'Registered Sellers',
      value: parseCount(userCounts?.approvedSellersCount),
      color: adminDashboardTheme.engagementSellerColor,
    },
    {
      key: 'affiliates',
      label: 'Registered Affiliates',
      value: parseCount(userCounts?.affiliateCount),
      color: adminDashboardTheme.engagementAffiliateColor,
    },
  ];
}

export function sumEngagementSegments(segments: AdminEngagementSegment[]): number {
  return segments.reduce((total, segment) => total + segment.value, 0);
}
