import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function getCacheDirectory(): string {
  const directory = FileSystem.cacheDirectory;
  if (!directory) {
    throw new Error('File cache is unavailable on this device.');
  }

  return directory;
}

async function shareFile(uri: string, mimeType: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, UTI: mimeType });
    return;
  }

  await Linking.openURL(uri);
}

export async function openRemotePdfUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('Label URL unavailable.');
  }

  if (Platform.OS === 'android') {
    const targetUri = `${getCacheDirectory()}seller-label-${Date.now()}.pdf`;

    const download = await FileSystem.downloadAsync(trimmed, targetUri);
    await shareFile(download.uri, 'application/pdf');
    return;
  }

  const canOpen = await Linking.canOpenURL(trimmed);
  if (!canOpen) {
    throw new Error('Unable to open shipping label.');
  }

  await Linking.openURL(trimmed);
}

export async function openBase64Pdf(base64: string, fileName: string): Promise<void> {
  const normalized = base64.includes(',') ? base64.split(',').pop() ?? '' : base64;
  const trimmed = normalized.trim();

  if (!trimmed) {
    throw new Error('Shipping label data is missing.');
  }

  const targetUri = `${getCacheDirectory()}${sanitizeFileName(fileName)}`;
  await FileSystem.writeAsStringAsync(targetUri, trimmed, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await shareFile(targetUri, 'application/pdf');
}

export async function openHtmlShippingLabel(html: string, fileName: string): Promise<void> {
  const trimmed = html.trim();
  if (!trimmed) {
    throw new Error('Generated label content is empty.');
  }

  const { uri } = await Print.printToFileAsync({
    html: trimmed,
    base64: false,
  });

  const targetUri = `${getCacheDirectory()}${sanitizeFileName(fileName)}`;
  await FileSystem.copyAsync({ from: uri, to: targetUri });
  await shareFile(targetUri, 'application/pdf');
}
