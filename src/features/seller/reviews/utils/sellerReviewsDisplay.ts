import type { Review } from '../../../../services/types/review';
import { formatOrderDate } from '../../../orders/utils/orderDisplay';
export function formatSellerReviewRating(value?: number | string | null): string {
  if (value == null || value === '') {
    return '—';
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '—';
  }

  return numeric.toFixed(1);
}

export function getSellerReviewProductName(review: Pick<Review, 'productId'>): string {
  if (review.productId && typeof review.productId === 'object') {
    return review.productId.productName?.trim() || '—';
  }

  if (typeof review.productId === 'string' && review.productId.trim()) {
    return review.productId.trim();
  }

  return '—';
}

export function getSellerReviewCustomerName(review: Pick<Review, 'UserId'>): string {
  if (typeof review.UserId === 'string') {
    return review.UserId.trim() || '—';
  }

  const fullName = [review.UserId?.firstName, review.UserId?.lastName].filter(Boolean).join(' ').trim();
  return fullName || '—';
}

export function getSellerReviewTitle(review: Pick<Review, 'title' | 'heading'>): string {
  return review.title?.trim() || review.heading?.trim() || '—';
}

export function getSellerReviewText(review: Pick<Review, 'reviewText' | 'comment'>): string {
  return review.reviewText?.trim() || review.comment?.trim() || '—';
}

export function formatSellerReviewStatus(status?: string | null): string {
  if (!status?.trim()) {
    return '—';
  }

  return status.trim();
}

export function sellerReviewStatusBadgeVariant(
  status?: string | null,
): 'success' | 'warning' | 'neutral' {
  const normalized = formatSellerReviewStatus(status);

  if (normalized === 'Approved') {
    return 'success';
  }

  if (normalized === 'Disapproved') {
    return 'warning';
  }

  return 'neutral';
}

export function formatSellerReviewDate(review: Pick<Review, 'createdAt' | 'updatedAt'>): string {
  return formatOrderDate(review.createdAt ?? review.updatedAt);
}

export function resolveReviewProductId(review: Pick<Review, 'productId'>): string | undefined {
  if (typeof review.productId === 'string' && review.productId.trim()) {
    return review.productId.trim();
  }

  if (review.productId && typeof review.productId === 'object' && review.productId._id?.trim()) {
    return review.productId._id.trim();
  }

  return undefined;
}

export function getReviewReplyId(review?: Pick<Review, 'replyReviewId'> | null): string | undefined {
  if (!review?.replyReviewId) {
    return undefined;
  }

  if (typeof review.replyReviewId === 'string') {
    return review.replyReviewId.trim() || undefined;
  }

  return review.replyReviewId._id?.trim() || undefined;
}

export function getEmbeddedSellerReply(review?: Pick<Review, 'replyReviewId'> | null): Review | null {
  if (review?.replyReviewId && typeof review.replyReviewId === 'object') {
    return review.replyReviewId;
  }

  return null;
}
