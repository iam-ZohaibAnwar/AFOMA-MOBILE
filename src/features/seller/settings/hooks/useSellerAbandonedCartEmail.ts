import { useCallback, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import { sendSellerAbandonedCartEmail } from '../api/sellerAbandonedCartEmailApi';

export function useSellerAbandonedCartEmail(sellerId?: string) {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const sendAbandonedCartEmail = useCallback(
    async (eventId: string, couponCode: string) => {
      const trimmedEventId = eventId.trim();
      const trimmedCouponCode = couponCode.trim();

      if (!trimmedEventId || !trimmedCouponCode) {
        setSendError('Please fill both fields.');
        return false;
      }

      if (!sellerId) {
        setSendError('Seller account not found.');
        return false;
      }

      setIsSending(true);
      setSendError(null);
      setSuccessMessage(null);

      try {
        const message = await sendSellerAbandonedCartEmail(sellerId, {
          eventId: trimmedEventId,
          couponCode: trimmedCouponCode,
        });
        setSuccessMessage(message);
        return true;
      } catch (err) {
        setSendError(getErrorMessage(err, 'Failed to send abandoned-cart email'));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [sellerId],
  );

  return {
    isSending,
    sendError,
    successMessage,
    sendAbandonedCartEmail,
    clearSendError,
    clearSuccessMessage,
  };
}
