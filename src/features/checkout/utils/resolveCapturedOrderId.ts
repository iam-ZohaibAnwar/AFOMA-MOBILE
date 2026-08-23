import type { CheckoutCaptureResult } from '../hooks/useCheckoutCapture';

export function resolveCapturedOrderId(captureResult: CheckoutCaptureResult | null): string | undefined {
  if (!captureResult) {
    return undefined;
  }

  const fromResponse = captureResult.response.orderId ?? captureResult.response._id;
  if (fromResponse) {
    return String(fromResponse);
  }

  const internalId = captureResult.details.find((detail) => detail.label === 'Internal Order ID')?.value;
  if (internalId) {
    return internalId;
  }

  const orderReference = captureResult.details.find((detail) => detail.label === 'Order Reference')?.value;
  return orderReference;
}
