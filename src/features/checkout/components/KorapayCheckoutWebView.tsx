import { useEffect, useRef, useState } from 'react';

import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WebView, type WebViewNavigation } from 'react-native-webview';



import { AppText } from '../../../components/ui/AppText';

import { colors, spacing } from '../../../design-system';

import {

  extractKorapayReference,

  isKorapayCheckoutCancelledUrl,

  isKorapayReturnUrl,

} from '../utils/korapayReturnUrl';



export interface KorapayCheckoutWebViewProps {

  visible: boolean;

  checkoutUrl: string | null;

  onComplete: (reference: string) => void;

  onCancel: () => void;

}



export function KorapayCheckoutWebView({

  visible,

  checkoutUrl,

  onComplete,

  onCancel,

}: KorapayCheckoutWebViewProps) {

  const insets = useSafeAreaInsets();

  const hasCompletedRef = useRef(false);

  const [currentUrl, setCurrentUrl] = useState<string | null>(checkoutUrl);

  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {

    if (visible && checkoutUrl) {

      hasCompletedRef.current = false;

      setCurrentUrl(checkoutUrl);

      setIsLoading(true);

    }

  }, [checkoutUrl, visible]);



  const finishWithComplete = (reference: string) => {

    if (hasCompletedRef.current) {

      return;

    }



    hasCompletedRef.current = true;

    onComplete(reference);

  };



  const finishWithCancel = () => {

    if (hasCompletedRef.current) {

      return;

    }



    hasCompletedRef.current = true;

    onCancel();

  };



  const handleNavigation = (navigation: WebViewNavigation) => {

    const url = navigation.url;

    if (!url) {

      return;

    }



    if (isKorapayCheckoutCancelledUrl(url)) {

      finishWithCancel();

      return;

    }



    if (isKorapayReturnUrl(url)) {

      const reference = extractKorapayReference(url);

      if (reference) {

        finishWithComplete(reference);

      }

    }

  };



  if (!visible || !checkoutUrl || !currentUrl) {

    return null;

  }



  return (

    <Modal

      visible={visible}

      animationType="slide"

      presentationStyle="fullScreen"

      onRequestClose={finishWithCancel}

    >

      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        <View style={styles.header}>

          <AppText variant="h3" style={styles.title}>

            Korapay

          </AppText>

          <Pressable accessibilityRole="button" onPress={finishWithCancel} hitSlop={8}>

            <AppText variant="bodyMedium" style={styles.close}>

              Close

            </AppText>

          </Pressable>

        </View>



        {isLoading ? (

          <View style={styles.loadingOverlay}>

            <ActivityIndicator size="large" color={colors.primary} />

            <AppText variant="bodySmall" color="textSecondary">

              Loading Korapay checkout...

            </AppText>

          </View>

        ) : null}



        <WebView

          source={{ uri: currentUrl }}

          style={styles.webview}

          javaScriptEnabled

          domStorageEnabled

          sharedCookiesEnabled

          thirdPartyCookiesEnabled

          setSupportMultipleWindows

          javaScriptCanOpenWindowsAutomatically

          onLoadStart={() => setIsLoading(true)}

          onLoadEnd={() => setIsLoading(false)}

          onNavigationStateChange={handleNavigation}

          onShouldStartLoadWithRequest={(request) => {

            if (isKorapayCheckoutCancelledUrl(request.url)) {

              finishWithCancel();

              return false;

            }



            if (isKorapayReturnUrl(request.url)) {

              const reference = extractKorapayReference(request.url);

              if (reference) {

                finishWithComplete(reference);

                return false;

              }

            }



            return true;

          }}

          onOpenWindow={(event) => {

            const targetUrl = event.nativeEvent.targetUrl;

            if (targetUrl) {

              setCurrentUrl(targetUrl);

            }

          }}

        />

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

});


