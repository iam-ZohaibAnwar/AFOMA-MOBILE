import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import { navigateToShop } from '../../../app/navigation/shoppingNavigation';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { AdminSettingsHubCardSkeleton } from '../../admin/settings/components/AdminSettingsHubCardSkeleton';
import { AdminSettingsHubSection } from '../../admin/settings/components/AdminSettingsHubSection';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerSetupProgress } from '../components/SellerSetupProgress';
import { SellerShopProfileHero } from '../profile/components/SellerShopProfileHero';
import { SellerShopProfileInfoCard } from '../profile/components/SellerShopProfileInfoCard';
import { SellerShopProfileSectionCard } from '../profile/components/SellerShopProfileSectionCard';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import type { SellerSetupSectionId } from '../types/sellerProfile';
import {
  SELLER_PROFILE_HUB_GROUPS,
  SELLER_PROFILE_SETUP_LINK_SECTIONS,
  getSellerProfileSectionIcon,
} from '../utils/sellerProfileSections';
import {
  getContinueSetupSection,
  isSellerProductCreationAllowed,
} from '../utils/sellerSetupSections';
import { formatSellerShopSlug, isSellerProfileSectionComplete } from '../profile/utils/sellerProfileDisplay';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerShopProfile'>;

const RETURN_TO = authReturnTo.sellerShopProfile();
const SKELETON_ITEMS = ['s1', 's2', 's3'] as const;

export function SellerShopProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(RETURN_TO);
  const { profile, isLoading, isRefreshing, error, reload } = useSellerProfile(
    isAuthorized ? sellerId : undefined,
  );

  const handleSectionPress = useCallback(
    (sectionId: SellerSetupSectionId) => {
      if (sectionId === 'domesticShipping' || sectionId === 'internationalShipping') {
        navigation.navigate('SellerShippingConfig');
        return;
      }

      navigation.navigate('SellerSetupSection', { section: sectionId });
    },
    [navigation],
  );

  const handleContinueSetup = useCallback(() => {
    const nextSection = getContinueSetupSection(profile);
    if (!nextSection) {
      navigation.navigate('SellerSetup');
      return;
    }

    handleSectionPress(nextSection);
  }, [handleSectionPress, navigation, profile]);

  const handleViewShop = useCallback(() => {
    const slug = profile?.storeSlug?.trim() || profile?.slug?.trim();
    if (!slug) {
      return;
    }

    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      navigateToShop(rootNavigation, slug);
    }
  }, [navigation, profile?.slug, profile?.storeSlug]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const showSkeleton = isLoading && !profile && !error;
  const setupComplete = isSellerProductCreationAllowed(profile?.profileSetup);
  const incompleteSetupSections = SELLER_PROFILE_SETUP_LINK_SECTIONS.filter(
    (section) => !isSellerProfileSectionComplete(section.id, profile),
  );
  const shopSlug = formatSellerShopSlug(profile);
  const canViewShop = shopSlug !== '—';

  if (error && !profile) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  return (
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
      <SellerShopProfileHero
        profile={profile}
        isRefreshing={isRefreshing}
        error={error && profile ? error : null}
      />

      <View style={styles.body}>
        {!setupComplete ? (
          <AppCard variant="flat">
            <SellerSetupProgress
              profileSetup={profile?.profileSetup}
              onContinue={handleContinueSetup}
              title="Finish setting up your shop"
              subtitle="Complete required sections to start selling."
              continueLabel="Continue setup"
            />
          </AppCard>
        ) : null}

        {showSkeleton ? (
          <View style={styles.skeletonList}>
            {SKELETON_ITEMS.map((key) => (
              <AdminSettingsHubCardSkeleton key={key} />
            ))}
          </View>
        ) : (
          <>
            <SellerShopProfileInfoCard profile={profile} />

            {canViewShop ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View your shop"
                onPress={handleViewShop}
                style={({ pressed }) => [styles.viewShopLink, pressed && styles.viewShopLinkPressed]}
              >
                <AppText variant="bodySmall" color="textLink" style={styles.viewShopText}>
                  View storefront →
                </AppText>
              </Pressable>
            ) : null}

            {SELLER_PROFILE_HUB_GROUPS.map((group) => (
              <AdminSettingsHubSection key={group.title} title={group.title}>
                <View style={styles.sectionList}>
                  {group.sections.map((section) => (
                    <SellerShopProfileSectionCard
                      key={section.id}
                      section={section}
                      icon={getSellerProfileSectionIcon(section.id)}
                      profile={profile}
                      onPress={() => handleSectionPress(section.id)}
                    />
                  ))}
                </View>
              </AdminSettingsHubSection>
            ))}

            {incompleteSetupSections.length > 0 ? (
              <AdminSettingsHubSection title="Selling requirements">
                <View style={styles.sectionList}>
                  {incompleteSetupSections.map((section) => (
                    <SellerShopProfileSectionCard
                      key={section.id}
                      section={section}
                      icon={getSellerProfileSectionIcon(section.id)}
                      profile={profile}
                      onPress={() => handleSectionPress(section.id)}
                    />
                  ))}
                </View>
              </AdminSettingsHubSection>
            ) : null}
          </>
        )}

        {error && profile ? (
          <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  body: {
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  skeletonList: {
    gap: spacing.md,
  },
  sectionList: {
    gap: spacing.sm,
  },
  viewShopLink: {
    alignSelf: 'flex-start',
    marginTop: -spacing.sm,
  },
  viewShopLinkPressed: {
    opacity: 0.88,
  },
  viewShopText: {
    fontWeight: '600',
  },
  inlineError: {
    marginHorizontal: 0,
  },
});
