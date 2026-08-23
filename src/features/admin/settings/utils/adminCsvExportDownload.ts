import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';

import { env } from '../../../../app/config/env';
import { getAccessToken } from '../../../../services/storage/secureStorage';
import { requestAdminCsvExport } from '../api/adminCsvExportApi';
import type { AdminCsvExportRequest, AdminCsvSchema } from '../types/adminCsvExport';

function getCacheDirectory(): string {
  const directory = FileSystem.cacheDirectory;
  if (!directory) {
    throw new Error('File cache is unavailable on this device.');
  }

  return directory;
}

function buildCsvDownloadUrl(schema: AdminCsvSchema): string {
  const base = env.apiUrl.replace(/\/$/, '');
  return `${base}/csv/${encodeURIComponent(schema)}.csv?t=${Date.now()}`;
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function shareCsvFile(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
    });
    return;
  }

  await Linking.openURL(uri);
}

export async function downloadAndShareAdminCsv(request: AdminCsvExportRequest): Promise<void> {
  await requestAdminCsvExport(request);

  const token = await getAccessToken();
  const downloadUrl = buildCsvDownloadUrl(request.schema);
  const targetUri = `${getCacheDirectory()}${sanitizeFileName(request.schema)}-${Date.now()}.csv`;

  const download = await FileSystem.downloadAsync(downloadUrl, targetUri, {
    headers: {
      'x-api-key': env.apiKey,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (download.status !== 200) {
    throw new Error('CSV download failed. Try again in a moment.');
  }

  await shareCsvFile(download.uri);
}
