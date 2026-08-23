import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { Review } from '../../../../services/types/review';
import {
  formatSellerReviewStatus,
  getSellerReviewText,
} from '../utils/sellerReviewsDisplay';
import { SellerReviewReplyComposer } from './SellerReviewReplyComposer';

export interface SellerReviewReplySectionProps {
  hasReply: boolean;
  sellerReply: Review | null;
  isLoadingReply: boolean;
  replyError: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  onSubmitReply: (replyText: string) => Promise<boolean>;
  onReloadReply: () => void;
  onClearFeedback: () => void;
}

export function SellerReviewReplySection({
  hasReply,
  sellerReply,
  isLoadingReply,
  replyError,
  isSubmitting,
  submitError,
  successMessage,
  onSubmitReply,
  onReloadReply,
  onClearFeedback,
}: SellerReviewReplySectionProps) {
  const [composerVisible, setComposerVisible] = useState(false);

  const handleOpenComposer = () => {
    onClearFeedback();
    setComposerVisible(true);
  };

  const handleCloseComposer = () => {
    if (isSubmitting) {
      return;
    }
    setComposerVisible(false);
  };

  const handleSubmit = (replyText: string) => {
    void onSubmitReply(replyText).then((didSubmit) => {
      if (didSubmit) {
        setComposerVisible(false);
      }
    });
  };

  if (hasReply || sellerReply) {
    return (
      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Your reply
        </AppText>

        {isLoadingReply && !sellerReply ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null}

        {replyError ? (
          <View style={styles.feedbackBlock}>
            <AppText variant="bodySmall" color="error">
              {replyError}
            </AppText>
            <AppButton label="Retry" size="md" variant="outline" onPress={onReloadReply} />
          </View>
        ) : null}

        {sellerReply ? (
          <>
            <AppText variant="bodyMedium" style={styles.replyText}>
              {getSellerReviewText(sellerReply)}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              Status: {formatSellerReviewStatus(sellerReply.reviewStatus)}
            </AppText>
          </>
        ) : null}
      </AppCard>
    );
  }

  return (
    <>
      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Seller reply
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.helper}>
          Respond to the customer review. Replies are reviewed before publication.
        </AppText>

        {successMessage ? (
          <AppText variant="bodySmall" color="success" style={styles.feedback}>
            {successMessage}
          </AppText>
        ) : null}

        {submitError ? (
          <AppText variant="bodySmall" color="error" style={styles.feedback}>
            {submitError}
          </AppText>
        ) : null}

        <AppButton
          label="Write a reply"
          onPress={handleOpenComposer}
          disabled={isSubmitting}
          size="md"
          style={styles.actionButton}
        />
      </AppCard>

      <SellerReviewReplyComposer
        visible={composerVisible}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
        onClose={handleCloseComposer}
        onSubmit={handleSubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  helper: {
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  replyText: {
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  loadingRow: {
    paddingVertical: spacing.sm,
  },
  feedbackBlock: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  feedback: {
    marginBottom: spacing.sm,
  },
});
