import { Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export async function copyProductLink(url: string): Promise<void> {
  await Clipboard.setStringAsync(url);
}

export async function shareProductLink(params: {
  title: string;
  url: string;
}): Promise<void> {
  const { title, url } = params;

  await Share.share(
    Platform.select({
      ios: { message: title, url, title },
      default: { message: `${title}\n${url}`, title },
    })!,
  );
}

export function promptProductShare(params: { title: string; url: string }): void {
  const { title, url } = params;

  Alert.alert('Share product', title, [
    {
      text: 'Copy link',
      onPress: () => {
        void copyProductLink(url).then(() => {
          Alert.alert('Link copied', 'Product link copied to clipboard.');
        });
      },
    },
    {
      text: 'Share',
      onPress: () => {
        void shareProductLink({ title, url });
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
