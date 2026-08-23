import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import {
  isPayPalApprovalCompleteUrl,
  isPayPalCheckoutCancelledUrl,
} from '../utils/paypalReturnUrl';
import {
  PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT,
  parsePayPalWebViewMessage,
} from '../utils/paypalWebViewScript';

interface PayPalCheckoutModalProps {
  visible: boolean;
  orderId: string | null;
  approvalUrl: string | null;
  currency?: string;
  processing?: boolean;
  onApproved: (orderId: string) => void;
  onCancelled: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export function PayPalCheckoutModal({
  visible,
  orderId,
  approvalUrl,
  processing = false,
  onApproved,
  onCancelled,
  onError,
  onClose,
}: PayPalCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const activeSessionRef = useRef<string | null>(null);
  const finishedRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);
  const onApprovedRef = useRef(onApproved);
  const onCancelledRef = useRef(onCancelled);
  const onErrorRef = useRef(onError);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [checkoutFinished, setCheckoutFinished] = useState(false);

  useEffect(() => {
    onApprovedRef.current = onApproved;
  }, [onApproved]);

  useEffect(() => {
    onCancelledRef.current = onCancelled;
  }, [onCancelled]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!visible || !approvalUrl || !orderId) {
      return;
    }

    if (activeSessionRef.current === orderId) {
      return;
    }

    activeSessionRef.current = orderId;
    finishedRef.current = false;
    hasLoadedOnceRef.current = false;
    setCheckoutFinished(false);
    setIsInitialLoading(true);
  }, [approvalUrl, orderId, visible]);

  useEffect(() => {
    if (!visible) {
      activeSessionRef.current = null;
      finishedRef.current = false;
      hasLoadedOnceRef.current = false;
      setCheckoutFinished(false);
      setIsInitialLoading(true);
    }
  }, [visible]);

  const finishOnce = (action: () => void) => {
    if (finishedRef.current || processing) {
      return;
    }

    finishedRef.current = true;
    setCheckoutFinished(true);
    webViewRef.current?.stopLoading();
    action();
  };

  const finishWithApproved = () => {
    if (!orderId) {
      return false;
    }

    finishOnce(() => onApprovedRef.current(orderId));
    return true;
  };

  const finishWithCancel = () => {
    finishOnce(() => onCancelledRef.current());
    return true;
  };

  const evaluateNavigation = (url: string | undefined): boolean => {
    if (!url || finishedRef.current || processing) {
      return false;
    }

    if (isPayPalCheckoutCancelledUrl(url)) {
      return finishWithCancel();
    }

    if (isPayPalApprovalCompleteUrl(url)) {
      return finishWithApproved();
    }

    return false;
  };

  const handleNavigation = (navigation: WebViewNavigation) => {
    evaluateNavigation(navigation.url);
  };

  const navigatePopupInSameWebView = (targetUrl?: string) => {
    if (!targetUrl || finishedRef.current || processing) {
      return;
    }

    webViewRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(targetUrl)}; true;`,
    );
  };

  const showWebView = !processing && !checkoutFinished && Boolean(approvalUrl);

  if (!visible || !approvalUrl || !orderId) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={processing || checkoutFinished ? undefined : onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <AppText variant="h3" style={styles.title}>
            Pay with PayPal
          </AppText>
          {!processing && !checkoutFinished ? (
            <Pressable onPress={onClose} hitSlop={8}>
              <AppText variant="bodyMedium" style={styles.close}>
                Close
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {processing || checkoutFinished ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="bodyMedium" style={styles.processingTitle}>
              Processing your payment
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.processingCopy}>
              Please wait while we confirm your order.
            </AppText>
          </View>
        ) : null}

        {isInitialLoading && showWebView ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="bodySmall" color="textSecondary">
              Loading PayPal checkout...
            </AppText>
          </View>
        ) : null}

        {showWebView ? (
          <WebView
            ref={webViewRef}
            source={{ uri: approvalUrl }}
            style={styles.webview}
            originWhitelist={['https://*', 'http://*']}
            injectedJavaScriptBeforeContentLoaded={PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT}
            injectedJavaScript={PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            onLoadStart={() => {
              if (!hasLoadedOnceRef.current) {
                setIsInitialLoading(true);
              }
            }}
            onLoadEnd={() => {
              hasLoadedOnceRef.current = true;
              setIsInitialLoading(false);
            }}
            onNavigationStateChange={handleNavigation}
            onShouldStartLoadWithRequest={(request) => !evaluateNavigation(request.url)}
            onOpenWindow={(event) => navigatePopupInSameWebView(event.nativeEvent.targetUrl)}
            onMessage={(event) => {
              const message = parsePayPalWebViewMessage(event.nativeEvent.data);
              if (message?.type === 'paypal_complete') {
                finishWithApproved();
              }
            }}
            onError={() => {
              if (!finishedRef.current) {
                finishOnce(() =>
                  onErrorRef.current('PayPal checkout failed to load. Please try again.'),
                );
              }
            }}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FED7AA',
  },
  title: {
    color: '#172554',
    fontWeight: '700',
  },
  close: {
    color: '#1F628E',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFF7ED',
    zIndex: 2,
  },
  processingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: '#FFF7ED',
  },
  processingTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  processingCopy: {
    textAlign: 'center',
  },
});
