import {
  createSellerReviewReply,
  getReviewById,
  linkReviewReply,
} from '../../../../services/api/reviewsApi';
import type { Review } from '../../../../services/types/review';
import type { SellerReviewDetail } from '../types/sellerReview';
import {
  getSellerReviewTitle,
  resolveReviewProductId,
} from '../utils/sellerReviewsDisplay';

/** POST /reviews/ then PUT /reviews/{parentReviewId} — web seller reply workflow. */
export async function submitSellerReviewReply(
  parentReview: SellerReviewDetail,
  userId: string,
  replyText: string,
): Promise<Review> {
  const parentReviewId = parentReview._id;
  const productId = resolveReviewProductId(parentReview);
  const sellerId = parentReview.sellerId?.trim();

  if (!parentReviewId || !productId || !sellerId) {
    throw new Error('This review is missing product or seller information.');
  }

  const trimmedReply = replyText.trim();
  if (!trimmedReply) {
    throw new Error('Reply cannot be empty.');
  }

  const parentTitle = getSellerReviewTitle(parentReview);
  const replyRecord = await createSellerReviewReply({
    productId,
    sellerId,
    UserId: userId,
    value: parentReview.value ?? 1,
    quality: parentReview.quality ?? 1,
    price: parentReview.price ?? 1,
    reviewText: trimmedReply,
    title: parentTitle !== '—' ? parentTitle : 'Seller reply',
    reviewStatus: 'Pending',
    isReply: true,
  });

  if (!replyRecord._id) {
    throw new Error('Reply was not created.');
  }

  return linkReviewReply(parentReviewId, { replyReviewId: replyRecord._id });
}

export async function getSellerReviewReply(replyReviewId: string): Promise<Review> {
  return getReviewById(replyReviewId);
}
