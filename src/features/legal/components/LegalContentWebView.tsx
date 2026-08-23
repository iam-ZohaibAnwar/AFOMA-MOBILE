import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { colors } from '../../../design-system';
import { buildLegalDocumentHtml } from '../utils/buildLegalDocumentHtml';

export interface LegalContentWebViewProps {
  htmlContent: string;
  /** Only enable when this WebView is nested inside another scroller. */
  nestedScrollEnabled?: boolean;
}

export function LegalContentWebView({
  htmlContent,
  nestedScrollEnabled = false,
}: LegalContentWebViewProps) {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildLegalDocumentHtml(htmlContent) }}
        style={styles.webView}
        scrollEnabled
        showsVerticalScrollIndicator
        nestedScrollEnabled={nestedScrollEnabled}
        {...(Platform.OS === 'android'
          ? { overScrollMode: 'never' as const }
          : { decelerationRate: 'normal' as const })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
