import type { AdminLatestSeller, AdminPopularSearchTerm } from '../types/adminDashboard';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export interface AdminEngagementBar {
  label: string;
  value: number;
}

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

function mapDayToBarIndex(day: number): number | null {
  if (day === 0) {
    return 5;
  }

  const index = day - 1;
  return index >= 0 && index < 6 ? index : null;
}

export function buildWeeklyEngagementBars(
  latestSellers: AdminLatestSeller[],
  searchTerms: AdminPopularSearchTerm[],
): AdminEngagementBar[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - weekMs;

  for (const seller of latestSellers) {
    if (!seller.createdAt) {
      continue;
    }

    const created = new Date(seller.createdAt).getTime();
    if (!Number.isFinite(created) || created < cutoff) {
      continue;
    }

    const index = mapDayToBarIndex(new Date(seller.createdAt).getDay());
    if (index != null) {
      buckets[index] += 1;
    }
  }

  const hasSellerActivity = buckets.some((value) => value > 0);
  if (hasSellerActivity) {
    return WEEKDAY_LABELS.map((label, index) => ({
      label,
      value: buckets[index],
    }));
  }

  if (searchTerms.length > 0) {
    return searchTerms.slice(0, 6).map((term, index) => ({
      label: WEEKDAY_LABELS[index] ?? `D${index + 1}`,
      value: Number(term.count ?? 0) || 0,
    }));
  }

  return WEEKDAY_LABELS.map((label) => ({ label, value: 0 }));
}
