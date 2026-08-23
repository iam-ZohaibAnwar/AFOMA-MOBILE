const PAYPAL_DISABLE_FUNDING = 'paylater,card,venmo,credit,ideal,sepa';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildPayPalCheckoutHtml(params: {
  clientId: string;
  currency: string;
  orderId: string;
}): string {
  const orderId = escapeHtml(params.orderId.trim());
  const sdkParams = new URLSearchParams({
    'client-id': params.clientId.trim(),
    currency: params.currency || 'CAD',
    intent: 'capture',
    components: 'buttons',
    'disable-funding': PAYPAL_DISABLE_FUNDING,
  }).toString();

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #fff7ed;
      }
      #status {
        color: #64748b;
        font-size: 14px;
        margin-bottom: 12px;
        text-align: center;
      }
    </style>
    <script>
      (function () {
        window.open = function (url) {
          if (url) {
            window.location.href = url;
          }
          return window;
        };
      })();
    </script>
    <script src="https://www.paypal.com/sdk/js?${sdkParams}" onload="initPayPalButtons()" onerror="reportPayPalSdkError()"></script>
  </head>
  <body>
    <div id="status">Tap the PayPal button below to sign in and approve your payment.</div>
    <div id="paypal-button-container"></div>
    <script>
      function post(type, payload) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...(payload || {}) }));
        }
      }

      function reportPayPalSdkError() {
        post('error', { message: 'PayPal SDK failed to load.' });
      }

      function initPayPalButtons() {
        if (!window.paypal) {
          reportPayPalSdkError();
          return;
        }

        paypal.Buttons({
          style: { color: 'blue', label: 'paypal', height: 55 },
          createOrder: function () {
            return "${orderId}";
          },
          onApprove: function (data) {
            post('approved', { orderID: data.orderID });
          },
          onCancel: function () {
            post('cancelled');
          },
          onError: function (err) {
            post('error', { message: String(err && err.message ? err.message : err) });
          },
        }).render('#paypal-button-container').catch(function (err) {
          post('error', { message: String(err && err.message ? err.message : err) });
        });
      }
    </script>
  </body>
</html>`;
}

export function buildPayPalPopupPatchScript(): string {
  return `
(function () {
  if (window.__afomaPayPalPopupPatch) {
    return true;
  }
  window.__afomaPayPalPopupPatch = true;
  window.open = function (url) {
    if (url) {
      window.location.href = url;
    }
    return window;
  };
})();
true;
`;
}
