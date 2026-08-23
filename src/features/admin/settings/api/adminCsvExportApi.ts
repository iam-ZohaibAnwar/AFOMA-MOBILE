import { apiGet } from '../../../../services/api/request';
import type { AdminCsvExportRequest } from '../types/adminCsvExport';

/** GET /settings/downloadCSV/{schema}?from=&to= — prepares CSV on backend (web parity). */
export async function requestAdminCsvExport({
  schema,
  fromDate,
  toDate,
}: AdminCsvExportRequest): Promise<void> {
  const params: Record<string, string> = {};
  if (fromDate?.trim()) {
    params.from = fromDate.trim();
  }
  if (toDate?.trim()) {
    params.to = toDate.trim();
  }

  await apiGet(
    `/settings/downloadCSV/${encodeURIComponent(schema)}`,
    Object.keys(params).length ? { params } : undefined,
    'Failed to prepare CSV export',
  );
}
