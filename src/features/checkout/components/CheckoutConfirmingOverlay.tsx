import { CheckoutProcessingLoader } from './CheckoutProcessingLoader';
import type { CheckoutConfirmingVariant } from '../utils/checkoutLoadingCopy';

interface CheckoutConfirmingOverlayProps {
  visible: boolean;
  message?: string;
  variant?: CheckoutConfirmingVariant;
}

/** @deprecated Use CheckoutProcessingLoader */
export function CheckoutConfirmingOverlay({
  visible,
  message,
  variant = 'paypal',
}: CheckoutConfirmingOverlayProps) {
  if (!visible) {
    return null;
  }

  return <CheckoutProcessingLoader overlay message={message} variant={variant} />;
}

/** @deprecated Use CheckoutProcessingLoader */
export function PayPalProcessingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) {
  return <CheckoutConfirmingOverlay visible={visible} message={message} variant="paypal" />;
}
