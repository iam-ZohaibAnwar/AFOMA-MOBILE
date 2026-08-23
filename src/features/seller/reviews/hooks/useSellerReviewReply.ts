import { useCallback, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../services/api/errors';
import type { Review } from '../../../../services/types/review';
import { getSellerReviewReply, submitSellerReviewReply } from '../api/sellerReviewReplyApi';
import type { SellerReviewDetail } from '../types/sellerReview';
import { getEmbeddedSellerReply, getReviewReplyId } from '../utils/sellerReviewsDisplay';

export function useSellerReviewReply(
  review: SellerReviewDetail | null,
  userId?: string,
  onParentReviewUpdated?: (nextReview: SellerReviewDetail) => void,
) {
  const replyReviewId = getReviewReplyId(review);
  const embeddedReply = getEmbeddedSellerReply(review);

  const [sellerReply, setSellerReply] = useState<Review | null>(embeddedReply);
  const [isLoadingReply, setIsLoadingReply] = useState(Boolean(replyReviewId) && !embeddedReply);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSellerReply = useCallback(async () => {
    if (!replyReviewId) {
      setSellerReply(null);
      setReplyError(null);
      setIsLoadingReply(false);
      return;
    }

    const cachedEmbedded = getEmbeddedSellerReply(review);
    if (cachedEmbedded) {
      setSellerReply(cachedEmbedded);
      setIsLoadingReply(false);
      return;
    }

    setIsLoadingReply(true);
    setReplyError(null);

    try {
      const response = await getSellerReviewReply(replyReviewId);
      setSellerReply(response);
    } catch (err) {
      setSellerReply(null);
      setReplyError(getErrorMessage(err, 'Failed to load seller reply'));
    } finally {
      setIsLoadingReply(false);
    }
  }, [replyReviewId, review]);

  useEffect(() => {
    const nextEmbedded = getEmbeddedSellerReply(review);
    if (nextEmbedded) {
      setSellerReply(nextEmbedded);
      setIsLoadingReply(false);
      return;
    }

    void loadSellerReply();
  }, [loadSellerReply, review]);

  const submitReply = useCallback(
    async (replyText: string) => {
      if (!review?._id || !userId || isSubmitting) {
        return false;
      }

      if (getReviewReplyId(review) || sellerReply) {
        setSubmitError('A reply has already been submitted for this review.');
        return false;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      setSuccessMessage(null);

      try {
        const updatedParent = await submitSellerReviewReply(review, userId, replyText);
        onParentReviewUpdated?.(updatedParent);

        const linkedReplyId = getReviewReplyId(updatedParent);
        if (linkedReplyId) {
          const response = await getSellerReviewReply(linkedReplyId);
          setSellerReply(response);
        }

        setSuccessMessage('Reply submitted and pending approval.');
        return true;
      } catch (err) {
        setSubmitError(getErrorMessage(err, 'Failed to submit reply'));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, onParentReviewUpdated, review, sellerReply, userId],
  );

  const clearSubmitFeedback = useCallback(() => {
    setSubmitError(null);
    setSuccessMessage(null);
  }, []);

  const hasReply = Boolean(getReviewReplyId(review) || sellerReply);

  return {
    sellerReply,
    isLoadingReply,
    replyError,
    isSubmitting,
    submitError,
    successMessage,
    hasReply,
    submitReply,
    reloadReply: loadSellerReply,
    clearSubmitFeedback,
  };
}
