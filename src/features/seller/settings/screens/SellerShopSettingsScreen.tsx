import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { AdminSettingsDetailHero } from '../../../admin/settings/components/AdminSettingsDetailHero';
import { AdminSettingsHubCardSkeleton } from '../../../admin/settings/components/AdminSettingsHubCardSkeleton';
import { AdminSettingsHubSection } from '../../../admin/settings/components/AdminSettingsHubSection';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerAbandonedCartEmailModal } from '../components/SellerAbandonedCartEmailModal';
import { SellerAbandonedCartSettingCard } from '../components/SellerAbandonedCartSettingCard';
import { SellerShopVisibilityCard } from '../components/SellerShopVisibilityCard';
import { useSellerAbandonedCartEmail } from '../hooks/useSellerAbandonedCartEmail';
import { useSellerShopVisibility } from '../hooks/useSellerShopVisibility';
import {
  getSellerShopDisplayName,
  getSellerShopVisibilityLabel,
  resolveSellerShopVisibilityMeta,
} from '../utils/shopVisibilityDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerShopSettings'>;

const RETURN_TO = authReturnTo.sellerShopSettings();
const SKELETON_ITEMS = ['s1', 's2'] as const;

function ActionErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.actionErrorBanner}>
      <AppText variant="bodySmall" color="error" style={styles.actionErrorText}>
        {message}
      </AppText>
      <AppButton label="Dismiss" variant="ghost" size="md" onPress={onDismiss} />
    </View>
  );
}

export function SellerShopSettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const { isAuthorized, sellerId } = useRequireSeller(RETURN_TO);

  const {
    profile,
    isLoading,
    isRefreshing,
    error,
    isUpdating,
    updateError,
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
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const shopName = getSellerShopDisplayName(profile);
  const visibilityMeta = resolveSellerShopVisibilityMeta(profile);
  const showSkeleton = isLoading && !profile && !error;

  if (error && !profile) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void reload()}
            tintColor={colors.primary}
          />
        }
      >
        <AdminSettingsDetailHero
          title="Shop settings"
          subtitle={shopName}
          icon="settings-outline"
          statusLabel={getSellerShopVisibilityLabel(profile)}
          statusIcon={visibilityMeta.icon}
        />

        <AppText variant="bodySmall" color="textSecondary" style={styles.lead}>
          Manage shop visibility and send abandoned-cart recovery emails.
        </AppText>

        {successMessage ? (
          <AppCard variant="flat" style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {successMessage}
            </AppText>
          </AppCard>
        ) : null}

        {updateError ? (
          <ActionErrorBanner message={updateError} onDismiss={clearUpdateError} />
        ) : null}

        {error && profile ? (
          <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
        ) : null}

        {showSkeleton ? (
          <View style={styles.skeletonList}>
            {SKELETON_ITEMS.map((key) => (
              <AdminSettingsHubCardSkeleton key={key} />
            ))}
          </View>
        ) : (
          <>
            <AdminSettingsHubSection title="Storefront">
              <SellerShopVisibilityCard
                profile={profile}
                isUpdating={isUpdating}
                onVisibilityChange={handleVisibilityChange}
              />
            </AdminSettingsHubSection>

            <AdminSettingsHubSection title="Customer outreach">
              <SellerAbandonedCartSettingCard onPress={handleOpenEmailModal} />
            </AdminSettingsHubSection>
          </>
        )}
      </ScrollView>

      <SellerAbandonedCartEmailModal
        visible={emailModalVisible}
        isSending={isSending}
        errorMessage={sendError}
        onClose={handleCloseEmailModal}
        onSubmit={(eventId, couponCode) => {
          void handleSendAbandonedCartEmail(eventId, couponCode);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  lead: {
    marginTop: -spacing.md,
  },
  successBanner: {
    marginTop: -spacing.sm,
  },
  actionErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    marginTop: -spacing.sm,
  },
  actionErrorText: {
    flex: 1,
  },
  inlineError: {
    marginHorizontal: 0,
  },
  skeletonList: {
    gap: spacing.md,
  },
});
