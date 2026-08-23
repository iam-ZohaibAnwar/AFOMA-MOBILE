import { apiGet, apiPost, apiPut } from '../../../../services/api/request';
import type {
  AdminSettingDocument,
  AdminSettingGetByTypeResponse,
  AdminSettingUpsertBody,
  AdminSettingsV1SettingType,
} from '../types/adminSettings';

/** GET /settings/type/{type} — admin settings read (V1 types). */
export async function getAdminSettingByType(
  type: AdminSettingsV1SettingType,
): Promise<AdminSettingGetByTypeResponse> {
  return apiGet<AdminSettingGetByTypeResponse>(
    `/settings/type/${encodeURIComponent(type)}`,
    undefined,
    'Failed to load setting',
  );
}

/** First document for a type, if present. */
export async function getAdminSettingDocumentByType(
  type: AdminSettingsV1SettingType,
): Promise<AdminSettingDocument | null> {
  const response = await getAdminSettingByType(type);
  return response.settings?.[0] ?? null;
}

/** PUT /settings/{id} — returns flat updated document (not wrapped). */
export async function putAdminSetting(
  settingId: string,
  body: AdminSettingUpsertBody,
): Promise<AdminSettingDocument> {
  return apiPut<AdminSettingDocument>(
    `/settings/${encodeURIComponent(settingId)}`,
    body,
    undefined,
    'Failed to update setting',
  );
}

/** POST /settings — create when no document exists for the type. */
export async function postAdminSetting(body: AdminSettingUpsertBody): Promise<AdminSettingDocument> {
  return apiPost<AdminSettingDocument>('/settings', body, undefined, 'Failed to create setting');
}
