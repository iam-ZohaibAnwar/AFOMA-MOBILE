/** Injected on PayPal redirect pages to patch popups and detect approval params. */
export const PAYPAL_WEBVIEW_INJECTED_JAVASCRIPT = `
(function () {
  if (window.__afomaPayPalWatcher) {
    return true;
  }
  window.__afomaPayPalWatcher = true;

  var notified = false;

  function postComplete(url) {
    if (notified) {
      return;
    }
    notified = true;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'paypal_complete', url: url || window.location.href }));
    }
  }

  function hasApprovalParams(url) {
    return /[?&](PayerID|payerID|payerId|paymentId)=/i.test(url);
  }

  window.open = function (url) {
    if (url) {
      window.location.href = url;
    }
    return window;
  };

  function checkUrl() {
    try {
      var href = window.location.href;
      if (hasApprovalParams(href)) {
        postComplete(href);
      }
    } catch (e) {}
  }

  var pushState = history.pushState;
  history.pushState = function () {
    pushState.apply(history, arguments);
    checkUrl();
  };

  var replaceState = history.replaceState;
  history.replaceState = function () {
    replaceState.apply(history, arguments);
    checkUrl();
  };

  window.addEventListener('popstate', checkUrl);
  setInterval(checkUrl, 500);
  checkUrl();
})();
true;
`;

export interface PayPalWebViewMessage {
  type: 'paypal_complete';
  url: string;
}

export function parsePayPalWebViewMessage(raw: string): PayPalWebViewMessage | null {
  try {
    const parsed = JSON.parse(raw) as PayPalWebViewMessage;
    if (parsed?.type === 'paypal_complete' && typeof parsed.url === 'string') {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}
