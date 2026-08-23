import { useEffect, useRef, useState } from 'react';

import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebView, type WebViewNavigation } from 'react-native-webview';



import { AppText } from '../../../components/ui/AppText';

import { colors, spacing } from '../../../design-system';

import {

  isPayPalApprovalCompleteUrl,

  isPayPalCheckoutCancelledUrl,

  isPayPalCheckoutUrl,

  isPayPalExternalReturnUrl,

} from '../utils/paypalReturnUrl';

import {

  PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT,

  parsePayPalWebViewMessage,

} from '../utils/paypalWebViewScript';



export interface PayPalApprovalWebViewProps {

  visible: boolean;

  approvalUrl: string | null;

  sessionOrderId?: string | null;

  processing?: boolean;

  onComplete: (returnUrl?: string) => void;

  onCancel: () => void;

}



export function PayPalApprovalWebView({

  visible,

  approvalUrl,

  sessionOrderId,

  processing = false,

  onComplete,

  onCancel,

}: PayPalApprovalWebViewProps) {

  const insets = useSafeAreaInsets();

  const webViewRef = useRef<WebView>(null);

  const hasSeenPayPalRef = useRef(false);

  const activeSessionRef = useRef<string | null>(null);

  const approvalFinishedRef = useRef(false);

  const onCompleteRef = useRef(onComplete);

  const onCancelRef = useRef(onCancel);

  const [currentUrl, setCurrentUrl] = useState<string | null>(approvalUrl);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [approvalFinished, setApprovalFinished] = useState(false);



  useEffect(() => {

    onCompleteRef.current = onComplete;

  }, [onComplete]);



  useEffect(() => {

    onCancelRef.current = onCancel;

  }, [onCancel]);



  useEffect(() => {

    if (!visible || !approvalUrl || !sessionOrderId) {

      return;

    }



    if (activeSessionRef.current === sessionOrderId) {

      return;

    }



    activeSessionRef.current = sessionOrderId;

    hasSeenPayPalRef.current = false;

    approvalFinishedRef.current = false;

    setApprovalFinished(false);

    setCurrentUrl(approvalUrl);

    setIsInitialLoading(true);

  }, [approvalUrl, sessionOrderId, visible]);



  useEffect(() => {

    if (!visible) {

      activeSessionRef.current = null;

      hasSeenPayPalRef.current = false;

      approvalFinishedRef.current = false;

      setApprovalFinished(false);

    }

  }, [visible]);



  const finishWithComplete = (returnUrl?: string) => {

    if (approvalFinishedRef.current || processing) {

      return false;

    }



    approvalFinishedRef.current = true;

    setApprovalFinished(true);

    webViewRef.current?.stopLoading();

    onCompleteRef.current(returnUrl);

    return true;

  };



  const finishWithCancel = () => {

    if (approvalFinishedRef.current || processing) {

      return false;

    }



    approvalFinishedRef.current = true;

    setApprovalFinished(true);

    webViewRef.current?.stopLoading();

    onCancelRef.current();

    return true;

  };



  const evaluateNavigation = (url: string | undefined): boolean => {

    if (!url || approvalFinishedRef.current || processing) {

      return false;

    }



    if (isPayPalCheckoutUrl(url)) {

      hasSeenPayPalRef.current = true;

    }



    if (isPayPalCheckoutCancelledUrl(url)) {

      return finishWithCancel();

    }



    if (isPayPalApprovalCompleteUrl(url)) {

      return finishWithComplete(url);

    }



    if (hasSeenPayPalRef.current && isPayPalExternalReturnUrl(url)) {

      return finishWithComplete(url);

    }



    return false;

  };



  const handleNavigation = (navigation: WebViewNavigation) => {

    evaluateNavigation(navigation.url);

  };



  const handleWebViewMessage = (raw: string) => {

    const message = parsePayPalWebViewMessage(raw);

    if (message?.type === 'paypal_complete') {

      finishWithComplete(message.url);

    }

  };



  const handleOpenWindow = (targetUrl?: string) => {

    if (!targetUrl || approvalFinishedRef.current || processing) {

      return;

    }



    setCurrentUrl(targetUrl);

  };



  const showWebView = !processing && !approvalFinished;



  if (!visible || !approvalUrl || !currentUrl) {

    return null;

  }



  return (

    <Modal

      visible={visible}

      animationType="slide"

      presentationStyle="fullScreen"

      onRequestClose={processing || approvalFinished ? undefined : finishWithCancel}

    >

      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        <View style={styles.header}>

          <AppText variant="h3" style={styles.title}>

            PayPal

          </AppText>

          {!processing && !approvalFinished ? (

            <Pressable accessibilityRole="button" onPress={finishWithCancel} hitSlop={8}>

              <AppText variant="bodyMedium" style={styles.close}>

                Close

              </AppText>

            </Pressable>

          ) : null}

        </View>



        {processing || approvalFinished ? (

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

            source={{ uri: currentUrl }}

            style={styles.webview}

            originWhitelist={['https://*', 'http://*', 'intent://*', 'afoma://*']}

            injectedJavaScriptBeforeContentLoaded={PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT}

            injectedJavaScript={PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT}

            javaScriptEnabled

            domStorageEnabled

            sharedCookiesEnabled

            thirdPartyCookiesEnabled

            javaScriptCanOpenWindowsAutomatically

            setSupportMultipleWindows

            onLoadStart={() => {

              if (!hasSeenPayPalRef.current) {

                setIsInitialLoading(true);

              }

            }}

            onLoadEnd={() => setIsInitialLoading(false)}

            onNavigationStateChange={handleNavigation}

            onShouldStartLoadWithRequest={(request) => {

              const shouldStop = evaluateNavigation(request.url);

              return !shouldStop;

            }}

            onOpenWindow={(event) => handleOpenWindow(event.nativeEvent.targetUrl)}

            onMessage={(event) => handleWebViewMessage(event.nativeEvent.data)}

          />

        ) : null}

      </View>

    </Modal>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: colors.background,

  },

  header: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: spacing.lg,

    paddingBottom: spacing.sm,

    borderBottomWidth: StyleSheet.hairlineWidth,

    borderBottomColor: colors.border,

  },

  title: {

    color: colors.textPrimary,

    fontWeight: '700',

  },

  close: {

    color: colors.textLink,

  },

  webview: {

    flex: 1,

    backgroundColor: colors.background,

  },

  loadingOverlay: {

    ...StyleSheet.absoluteFillObject,

    top: 56,

    alignItems: 'center',

    justifyContent: 'center',

    gap: spacing.sm,

    backgroundColor: colors.background,

    zIndex: 2,

  },

  processingOverlay: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    gap: spacing.sm,

    paddingHorizontal: spacing.xl,

    backgroundColor: colors.background,

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


