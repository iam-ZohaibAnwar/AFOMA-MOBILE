import { apiGet } from './request';

export interface SettingsEntry {
  type?: string;
  content?: string | Array<{ id?: string }> | Record<string, unknown>;
}

export interface SettingsAllTypesResponse {
  settings?: SettingsEntry[];
}

export interface SettingsTypeResponse {
  settings?: SettingsEntry[];
}

/** GET /settings/type/{type} — CMS content by type (e.g. terms-conditions). */
export async function getSettingsByType(type: string): Promise<SettingsTypeResponse> {
  return apiGet<SettingsTypeResponse>(
    `/settings/type/${encodeURIComponent(type)}`,
    undefined,
    'Failed to load content',
  );
}

/**
 * Parses CMS `content` field — JSON-encoded HTML string (Quill) or raw HTML.
 * Web parity: terms page uses JSON.parse(settings[0].content).
 */
export function parseSettingsHtmlContent(rawContent: unknown): string {
  if (typeof rawContent !== 'string') {
    return '';
  }

  const trimmed = rawContent.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (typeof parsed === 'string') {
      return parsed.trim();
    }
  } catch {
    // Fall through to raw HTML string.
  }

  return trimmed;
}

/** GET /settings/all/types — featured shop IDs for home spotlight. */
export async function getAllSettingsTypes(): Promise<SettingsAllTypesResponse> {
  return apiGet<SettingsAllTypesResponse>(
    '/settings/all/types',
    undefined,
    'Failed to load marketplace settings',
  );
}

export function extractFeaturedShopIds(settings: SettingsEntry[] | undefined): string[] {
  if (!settings?.length) {
    return [];
  }

  const shopIds: string[] = [];

  for (const setting of settings) {
    if (setting.type !== 'shops') {
      continue;
    }

    let content: unknown = setting.content;
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch {
        continue;
      }
    }

    if (!Array.isArray(content)) {
      continue;
    }

    for (const seller of content) {
      if (seller && typeof seller === 'object' && 'id' in seller && seller.id) {
        shopIds.push(String(seller.id));
      }
    }
  }

  return shopIds;
}
