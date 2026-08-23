import type { SelectOption } from '../../../utils/regionOptions';

export const BLOCKED_REGISTRATION_COUNTRIES = [
  'Belarus',
  'Central African Republic',
  'China',
  "Korea, Democratic People's Republic Of",
  'Democratic Republic Of Congo',
  'Guatemala',
  'Haiti',
  'Iran, Islamic Republic Of',
  'Iraq',
  'Lebanon',
  'Libya',
  'Moldova',
  'Myanmar',
  'Nicaragua',
  'Russian Federation',
  'Somalia',
  'South Sudan',
  'Sri Lanka',
  'Sudan',
  'Syria',
  'Ukraine',
  'Venezuela, Bolivarian Republic Of',
  'Yemen',
] as const;

export const REFERRAL_SOURCE_OPTIONS: SelectOption[] = [
  { value: 'social_instagram', label: 'Social Media – Instagram' },
  { value: 'social_tiktok', label: 'Social Media – TikTok' },
  { value: 'social_facebook', label: 'Social Media – Facebook' },
  { value: 'social_twitter', label: 'Social Media – Twitter/X' },
  { value: 'google_search', label: 'Google Search' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog_article', label: 'Blog or Online Article' },
  { value: 'word_of_mouth', label: 'Word of Mouth / Referred by a Friend' },
  { value: 'referred_by_seller', label: 'Referred by Another AFOMA Seller' },
  { value: 'referred_by_buyer', label: 'Referred by Another AFOMA Buyer' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'other', label: 'Other (please specify)' },
];

export const SOCIAL_MEDIA_OPTIONS: SelectOption[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'none', label: 'None' },
];

export function requiresReferralMember(referralSource: string): boolean {
  return referralSource === 'referred_by_seller' || referralSource === 'referred_by_buyer';
}
