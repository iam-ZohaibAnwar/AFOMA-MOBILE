export const ADMIN_CSV_SCHEMA_OPTIONS = [
  { value: 'buyers', label: 'Customers' },
  { value: 'sellers', label: 'Sellers' },
  { value: 'affiliate', label: 'Affiliates' },
  { value: 'subscribers', label: 'Subscribers' },
  { value: 'guestusers', label: 'Guest users' },
  { value: 'training', label: 'Training' },
] as const;

export type AdminCsvSchema = (typeof ADMIN_CSV_SCHEMA_OPTIONS)[number]['value'];

export interface AdminCsvExportRequest {
  schema: AdminCsvSchema;
  fromDate?: string;
  toDate?: string;
}
