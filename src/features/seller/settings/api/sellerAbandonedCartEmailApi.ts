import { ApiError } from '../../../../services/api/errors';
import { apiPost } from '../../../../services/api/request';

export interface SendAbandonedCartEmailPayload {
  eventId: string;
  couponCode: string;
}

interface SendAbandonedCartEmailResponse {
  message?: string;
  error?: string;
}

/**
 * POST /sellers/send-email/cart/{sellerId}
 *
 * Sends an abandoned-cart recovery email to a customer. Web parity:
 * body `{ eventId, couponCode }`; response `{ message }` or `{ error }`.
 */
export async function sendSellerAbandonedCartEmail(
  sellerId: string,
  payload: SendAbandonedCartEmailPayload,
): Promise<string> {
  const response = await apiPost<SendAbandonedCartEmailResponse>(
    `/sellers/send-email/cart/${encodeURIComponent(sellerId)}`,
    {
      eventId: payload.eventId.trim(),
      couponCode: payload.couponCode.trim(),
    },
    undefined,
    'Failed to send abandoned-cart email',
  );

  if (typeof response.error === 'string' && response.error.trim().length > 0) {
    throw new ApiError(response.error.trim());
  }

  if (typeof response.message === 'string' && response.message.trim().length > 0) {
    return response.message.trim();
  }

  return 'Email sent successfully';
}
