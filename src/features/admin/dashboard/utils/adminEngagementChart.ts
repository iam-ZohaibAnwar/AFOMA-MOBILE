import type { AdminLatestSeller } from '../types/adminDashboard';

export function countNewSignupsThisWeek(latestSellers: AdminLatestSeller[]): number {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - weekMs;

  return latestSellers.filter((seller) => {
    if (!seller.createdAt) {
      return false;
    }

    const created = new Date(seller.createdAt).getTime();
    return Number.isFinite(created) && created >= cutoff;
  }).length;
}
