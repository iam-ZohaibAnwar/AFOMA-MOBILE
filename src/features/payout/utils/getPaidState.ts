import type { GetPaidUiState, PayoutCommissionDetail } from '../types/payoutCommission';

export const GET_PAID_MESSAGES = {
  paid: {
    title: 'Payout Completed',
    body: 'Your payout has been successfully processed and the funds should be available per Korapay and your bank or wallet provider.',
  },
  inProcess: {
    title: 'Payout In Progress',
    body: 'Your payout was submitted to Korapay and is processing. Status will update to paid when the transfer completes.',
  },
  inProcessSubmitted: {
    title: 'Payout In Progress',
    body: 'Your payout request was received and is being processed.',
  },
  contactSupport: {
    title: 'Contact Support',
    body: 'We could not load this payout link. Please contact support if you need help.',
  },
  missingToken: {
    title: 'Invalid payout link',
    body: 'No payout token was found in this link.',
  },
} as const;

export function resolveGetPaidUiState(
  commissionId: string | null,
  commission: PayoutCommissionDetail | null,
  isLoading: boolean,
  loadError: string | null,
): GetPaidUiState {
  if (!commissionId) {
    return 'missing_token';
  }

  if (isLoading && !commission) {
    return 'loading';
  }

  if (!commission) {
    return 'contact_support';
  }

  if (commission.payoutStatus === 'Paid') {
    return 'paid';
  }

  if (commission.payoutStatus === 'InProcess') {
    return 'in_process';
  }

  if (commission.isPayout && commission.payoutStatus !== 'Paid') {
    return 'in_process_submitted';
  }

  return 'actionable';
}

export function getGetPaidStatusMessage(
  uiState: GetPaidUiState,
  loadError: string | null,
): { title: string; body: string } {
  switch (uiState) {
    case 'paid':
      return GET_PAID_MESSAGES.paid;
    case 'in_process':
      return GET_PAID_MESSAGES.inProcess;
    case 'in_process_submitted':
      return GET_PAID_MESSAGES.inProcessSubmitted;
    case 'missing_token':
      return GET_PAID_MESSAGES.missingToken;
    case 'contact_support':
      return {
        title: GET_PAID_MESSAGES.contactSupport.title,
        body: loadError?.trim() || GET_PAID_MESSAGES.contactSupport.body,
      };
    default:
      return { title: '', body: '' };
  }
}

/** Korapay corridor pre-selection — web parity from seller/affiliate profile country. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  KE: 'KES',
  GH: 'GHS',
  ZA: 'ZAR',
  CI: 'XOF',
};

export function extractCountryCodeFromParty(
  party: PayoutCommissionDetail['seller'] | PayoutCommissionDetail['userId'],
): string {
  if (!party || typeof party !== 'object') {
    return '';
  }

  const countryCode = party.countryCode;
  if (typeof countryCode === 'string' && countryCode.trim()) {
    return countryCode.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  }

  const country = party.country;
  if (country && typeof country === 'object') {
    const value = country.value ?? country.code ?? country.isoCode;
    if (typeof value === 'string' && value.trim()) {
      return value.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    }
  }

  return '';
}

export function marketCurrencyForCountryCode(countryCode: string): string {
  const upper = countryCode.trim().toUpperCase().slice(0, 2);
  return COUNTRY_TO_CURRENCY[upper] ?? '';
}

export function buildProfileCountryHint(commission: PayoutCommissionDetail): string | null {
  const sellerCode = extractCountryCodeFromParty(commission.seller);
  const affiliateCode = extractCountryCodeFromParty(commission.userId);
  const countryCode = sellerCode || affiliateCode;

  if (!countryCode) {
    return null;
  }

  const inferredCurrency = marketCurrencyForCountryCode(countryCode);
  const role = commission.seller ? 'seller' : commission.userId ? 'account' : 'profile';

  if (inferredCurrency) {
    return `Country code from ${role} profile: ${countryCode} — corridor pre-selected (${inferredCurrency})`;
  }

  return `Country code from ${role} profile: ${countryCode} — pick a corridor below`;
}
