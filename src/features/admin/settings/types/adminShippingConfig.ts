/** Tier in global shipping matrix — `countires` typo matches backend/web. */
export interface AdminShippingTier {
  tierName: string;
  countires: string[];
}

export interface AdminShippingMatrixEntry {
  from: string;
  to: string;
  surcharge: number;
}

export interface AdminShippingConfigDocument {
  _id?: string;
  tiers: AdminShippingTier[];
  matrix: AdminShippingMatrixEntry[];
}

/** Nested surcharge map for form inputs — values are string for TextInput. */
export type AdminShippingMatrixMap = Record<string, Record<string, string>>;

export interface AdminShippingTierDraft {
  tierName: string;
  countires: string[];
}

export interface AdminShippingConfigSavePayload {
  _id?: string;
  tiers: AdminShippingTier[];
  matrix: AdminShippingMatrixEntry[];
}
