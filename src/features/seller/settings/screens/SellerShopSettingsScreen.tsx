import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerAbandonedCartEmailModal } from '../components/SellerAbandonedCartEmailModal';
import { useSellerAbandonedCartEmail } from '../hooks/useSellerAbandonedCartEmail';
import { useSellerShopVisibility } from '../hooks/useSellerShopVisibility';
import {
  getSellerShopDisplayName,
  getSellerShopVisibilityLabel,
} from '../utils/shopVisibilityDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerShopSettings'>;

const RETURN_TO = authReturnTo.sellerShopSettings();

export function SellerShopSettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const { isAuthorized, sellerId } = useRequireSeller(RETURN_TO);
  const {
    profile,
    isLoading,
    error,
    isUpdating,
    updateError,
    isVisible,
    setShopVisibility,
    reload,
    clearUpdateError,
  } = useSellerShopVisibility(isAuthorized ? sellerId : undefined);
  const {
    isSending,
    sendError,
    successMessage,
    sendAbandonedCartEmail,
    clearSendError,
    clearSuccessMessage,
  } = useSellerAbandonedCartEmail(isAuthorized ? sellerId : undefined);

  const handleVisibilityChange = (nextVisible: boolean) => {
    if (isUpdating) {
      return;
    }

    clearUpdateError();

    if (!nextVisible) {
      Alert.alert(
        'Hide your shop?',
        'Your storefront will be hidden from buyers until you turn visibility back on.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Hide shop',
            style: 'destructive',
            onPress: () => {
              void setShopVisibility(false);
            },
          },
        ],
      );
      return;
    }

    void setShopVisibility(true);
  };

  const handleOpenEmailModal = () => {
    clearSendError();
    clearSuccessMessage();
    setEmailModalVisible(true);
  };

  const handleCloseEmailModal = () => {
    if (isSending) {
      return;
    }

    setEmailModalVisible(false);
    clearSendError();
  };

  const handleSendAbandonedCartEmail = async (eventId: string, couponCode: string) => {
    const didSend = await sendAbandonedCartEmail(eventId, couponCode);
    if (didSend) {
      setEmailModalVisible(false);
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !profile) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const shopName = getSellerShopDisplayName(profile);
  const visibilityLabel = getSellerShopVisibilityLabel(profile);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <AppCard variant="muted">
        <AppText variant="bodyMedium" style={styles.title}>
          Shop settings
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.copy}>
          Manage shop visibility and send abandoned-cart recovery emails to customers.
        </AppText>
      </AppCard>

      {successMessage ? (
        <AppCard variant="flat">
          <AppText variant="bodySmall" color="success">
            {successMessage}
          </AppText>
        </AppCard>
      ) : null}

      {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.error} /> : null}
      {updateError ? (
        <ErrorState message={updateError} onAction={clearUpdateError} style={styles.error} />
      ) : null}

      <AppCard variant="flat">
        <View style={styles.visibilityRow}>
          <View style={styles.visibilityCopy}>
            <AppText variant="bodyMedium" style={styles.rowTitle}>
              Shop visibility
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {shopName}
            </AppText>
            <AppText variant="caption" color={isVisible ? 'success' : 'textMuted'}>
              {visibilityLabel}
            </AppText>
          </View>

          <View style={styles.switchWrap}>
            {isUpdating ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            <Switch
              value={isVisible}
              onValueChange={handleVisibilityChange}
              disabled={isUpdating}
              trackColor={{ false: colors.borderStrong, true: colors.primarySoft }}
              thumbColor={isVisible ? colors.primary : colors.surface}
            />
          </View>
        </View>

        <AppText variant="bodySmall" color="textSecondary" style={styles.helper}>
          When visibility is off, your shop and products are hidden from the marketplace.
        </AppText>
      </AppCard>

      <AppCard variant="flat">
        <View style={styles.emailRow}>
          <View style={styles.emailCopy}>
            <AppText variant="bodyMedium" style={styles.rowTitle}>
              Abandoned-cart email
            </AppText>
            <AppText variant="bodySmall" color="textSecondary">
              Send a recovery email to a customer who left items in their cart.
            </AppText>
          </View>

          <AppButton label="Send" variant="outline" size="md" onPress={handleOpenEmailModal} />
        </View>

        <AppText variant="bodySmall" color="textSecondary" style={styles.helper}>
          Use the coupon code you want to offer and the event ID from the notification email.
        </AppText>
      </AppCard>

      <SellerAbandonedCartEmailModal
        visible={emailModalVisible}
        isSending={isSending}
        errorMessage={sendError}
        onClose={handleCloseEmailModal}
        onSubmit={(eventId, couponCode) => {
          void handleSendAbandonedCartEmail(eventId, couponCode);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  copy: { lineHeight: 20 },
  error: { alignSelf: 'stretch', marginHorizontal: 0 },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  visibilityCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  switchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  helper: {
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  emailCopy: {
    flex: 1,
    gap: spacing.xs,
  },
});
