/** V1 admin-managed setting document types (Phase 1 contract). */
export type AdminCommissionRateSettingType =
  | 'affiliate-commission'
  | 'seller-referral-commission'
  | 'buyer-referral-commission';

export type AdminSettingsV1SettingType = AdminCommissionRateSettingType | 'shops';

/** Raw setting document from GET /settings/type/:type or PUT /settings/:id. */
export interface AdminSettingDocument {
  _id: string;
  type: AdminSettingsV1SettingType | string;
  content: string;
  createdBy?: string;
  __v?: number;
}

export interface AdminSettingGetByTypeResponse {
  message?: string;
  settings?: AdminSettingDocument[];
}

/** PUT /settings/:id and POST /settings request body (web parity). */
export interface AdminSettingUpsertBody {
  type: AdminSettingsV1SettingType | string;
  /** Already JSON-stringified payload string. */
  content: string;
  createdBy: string;
}

/** Parsed commission rate — UI/domain value, not raw API string. */
export type AdminCommissionRateValue = number;

/**
 * Featured shop entry persisted in settings `shops` content.
 * Web stores full seller list objects (not IDs-only).
 */
export interface AdminFeaturedShopSeller {
  id?: string;
  _id?: string;
  uuid?: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userRole?: string;
  city?: string;
  country?: string;
  phone?: string;
  [key: string]: unknown;
}

/** Separates raw API document from parsed domain content. */
export interface AdminSettingParsedContent {
  commissionRate: AdminCommissionRateValue | null;
  featuredShops: AdminFeaturedShopSeller[];
}

export interface AdminCommissionRateSettingView {
  rateType: AdminCommissionRateSettingType;
  document: AdminSettingDocument | null;
  value: AdminCommissionRateValue | null;
}

export interface AdminFeaturedShopsSettingView {
  document: AdminSettingDocument | null;
  shops: AdminFeaturedShopSeller[];
}
