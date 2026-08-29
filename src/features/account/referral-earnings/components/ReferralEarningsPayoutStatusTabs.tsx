import { ScrollableOrderStatusTabs } from '../../../orders/components/ScrollableOrderStatusTabs';
import type { ReferralEarningsPayoutStatusFilter } from '../types/referralEarning';
import { REFERRAL_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS } from '../utils/referralEarningsListTabs';

export interface ReferralEarningsPayoutStatusTabsProps {
  activeStatus: ReferralEarningsPayoutStatusFilter;
  onStatusChange: (status: ReferralEarningsPayoutStatusFilter) => void;
}

export function ReferralEarningsPayoutStatusTabs({
  activeStatus,
  onStatusChange,
}: ReferralEarningsPayoutStatusTabsProps) {
  return (
    <ScrollableOrderStatusTabs
      tabs={REFERRAL_EARNINGS_PAYOUT_STATUS_FILTER_OPTIONS}
      activeValue={activeStatus}
      onChange={onStatusChange}
    />
  );
}
