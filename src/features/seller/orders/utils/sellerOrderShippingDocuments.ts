import { Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';

function sanitizeFileName(value: string): string {
  const normalized = value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  if (!normalized) {
    return 'shipping-label.pdf';
  }

  return normalized.toLowerCase().endsWith('.pdf') ? normalized : `${normalized}.pdf`;
}

function getDocumentDirectory(): string {
  const directory = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error('File storage is unavailable on this device.');
  }

  return directory;
}

function getCacheDirectory(): string {
  const directory = FileSystem.cacheDirectory;
  if (!directory) {
    throw new Error('File cache is unavailable on this device.');
  }

  return directory;
}

async function persistPdfCopy(sourceUri: string, fileName: string): Promise<string> {
  const targetUri = `${getDocumentDirectory()}${sanitizeFileName(fileName)}`;

  if (sourceUri === targetUri) {
    return targetUri;
  }

  await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
  return targetUri;
}

async function openLocalPdf(localUri: string): Promise<void> {
  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(localUri);
    await Linking.openURL(contentUri);
    return;
  }

  const canOpen = await Linking.canOpenURL(localUri);
  if (canOpen) {
    await Linking.openURL(localUri);
    return;
  }

  throw new Error('Unable to open the shipping label on this device.');
}

async function savePdfToAndroidDownloads(localUri: string, fileName: string): Promise<void> {
  const { StorageAccessFramework } = FileSystem;
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(
    StorageAccessFramework.getUriForDirectoryInRoot('Download'),
  );

  if (!permissions.granted) {
    await openLocalPdf(localUri);
    return;
  }

  const baseName = sanitizeFileName(fileName).replace(/\.pdf$/i, '');
  const destUri = await StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    baseName,
    'application/pdf',
  );

  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.writeAsStringAsync(destUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await openLocalPdf(localUri);
}

async function downloadLocalPdf(localUri: string, fileName: string): Promise<void> {
  const savedUri = await persistPdfCopy(localUri, fileName);

  if (Platform.OS === 'android') {
    await savePdfToAndroidDownloads(savedUri, fileName);
    return;
  }

  await openLocalPdf(savedUri);
}

export async function openRemotePdfUrl(url: string): Promise<void> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error('Label URL unavailable.');
  }

  if (Platform.OS === 'ios') {
    const canOpen = await Linking.canOpenURL(trimmed);
    if (!canOpen) {
      throw new Error('Unable to open shipping label.');
    }

    await Linking.openURL(trimmed);
    return;
  }

  const targetUri = `${getCacheDirectory()}seller-label-${Date.now()}.pdf`;
  const download = await FileSystem.downloadAsync(trimmed, targetUri);
  await downloadLocalPdf(download.uri, `shipping-label-${Date.now()}.pdf`);
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

  await downloadLocalPdf(targetUri, fileName);
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

  await downloadLocalPdf(uri, fileName);
}
