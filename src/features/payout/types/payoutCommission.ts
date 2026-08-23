/** Party on a commission record — seller or affiliate user. */
export interface PayoutCommissionParty {
  _id?: string;
  countryCode?: string;
  country?: {
    value?: string;
    code?: string;
    isoCode?: string;
  };
}

/** GET /commission/{commissionId} — used by the public get-paid flow. */
export interface PayoutCommissionDetail {
  _id?: string;
  payoutStatus?: string;
  isPayout?: boolean;
  payoutAmount?: number | string;
  referralAmount?: number | string;
  seller?: PayoutCommissionParty;
  userId?: PayoutCommissionParty;
}

export type GetPaidUiState =
  | 'missing_token'
  | 'loading'
  | 'contact_support'
  | 'paid'
  | 'in_process'
  | 'in_process_submitted'
  | 'actionable';
