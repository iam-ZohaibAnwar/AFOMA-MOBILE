import { colors } from '../../../design-system';
import type { Review } from '../../../services/types/review';

export function getBuyerReviews(reviews: Review[]): Review[] {
  return reviews.filter((review) => !review.isReply);
}

export function getReviewRating(review: Review): number {
  const value = review.avgRating ?? review.value ?? review.quality ?? review.price;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.min(5, Math.max(1, value));
  }

  return 5;
}

export function getAverageReviewRating(reviews: Review[]): number | undefined {
  const buyerReviews = getBuyerReviews(reviews);
  if (buyerReviews.length === 0) {
    return undefined;
  }

  const total = buyerReviews.reduce((sum, review) => sum + getReviewRating(review), 0);
  return total / buyerReviews.length;
}

export interface ReviewStarBreakdownRow {
  star: number;
  count: number;
  percentage: number;
}

export function getReviewStarBreakdown(reviews: Review[]): ReviewStarBreakdownRow[] {
  const buyerReviews = getBuyerReviews(reviews);
  const total = buyerReviews.length;

  return [5, 4, 3, 2, 1].map((star) => {
    const count = buyerReviews.filter((review) => Math.round(getReviewRating(review)) === star).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return { star, count, percentage };
  });
}

export function getReviewerName(review: Review): string {
  const user = review.UserId;
  if (typeof user === 'string') {
    return 'Verified buyer';
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Verified buyer';
}

export function getReviewerInitial(review: Review): string {
  const name = getReviewerName(review);
  return name.charAt(0).toUpperCase() || 'V';
}

export function getReviewerAvatarColors(_review: Review): { background: string; text: string } {
  return { background: colors.surfaceWhite, text: colors.textPrimary };
}

export function getReviewHeadline(review: Review): string | undefined {
  return review.heading?.trim() || review.title?.trim() || undefined;
}

export function getReviewBody(review: Review): string {
  return (
    review.comment?.trim() ||
    review.reviewText?.trim() ||
    'Great product and smooth shopping experience.'
  );
}

export function getReviewProductImages(review: Review): string[] {
  const images = review.productId?.images;
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => image?.imageUrl?.trim())
    .filter((url): url is string => Boolean(url))
    .slice(0, 2);
}

export function formatReviewRelativeDate(createdAt?: string): string {
  if (!createdAt) {
    return 'Recently';
  }

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return 'Today';
  }

  if (days === 1) {
    return '1 day ago';
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
