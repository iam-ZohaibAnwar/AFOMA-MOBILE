import { useCallback } from 'react';

import {

  ActivityIndicator,

  Pressable,

  RefreshControl,

  ScrollView,

  StyleSheet,

  View,

} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFocusEffect } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { ErrorState } from '../../../../components/ecommerce/ErrorState';

import { AppBadge } from '../../../../components/ui/AppBadge';

import { AppCard } from '../../../../components/ui/AppCard';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';

import {

  ADMIN_SELLER_DETAIL_SECTIONS,

  type AdminEditableSellerSectionId,

  type AdminSellerDetailSectionId,

} from '../types/adminSellerManagement';

import {

  approvalStatusBadgeVariant,

  formatAdminSellerApprovalStatus,

  getAdminSellerDisplayName,

  getAdminSellerShopVisibilityLabel,

  shopVisibilityBadgeVariant,

} from '../utils/adminSellerDisplay';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerDetail'>;



function isEditableSection(sectionId: AdminSellerDetailSectionId): sectionId is AdminEditableSellerSectionId {

  return sectionId !== 'basic-information';

}



export function AdminSellerDetailScreen({ navigation, route }: Props) {

  const insets = useSafeAreaInsets();

  const { sellerId, initialSeller } = route.params;

  const returnTo = authReturnTo.adminSellerDetail(sellerId, initialSeller);

  const { isAuthorized } = useRequireAdmin(returnTo);



  const { seller, isLoading, isRefreshing, error, refresh, syncSessionPatch } = useAdminSellerDetail(

    isAuthorized ? sellerId : undefined,

    initialSeller,

  );



  useFocusEffect(

    useCallback(() => {

      syncSessionPatch();

    }, [syncSessionPatch]),

  );



  const handleSectionPress = useCallback(

    (sectionId: AdminSellerDetailSectionId) => {

      const displaySeller = seller ?? initialSeller;



      if (sectionId === 'basic-information') {

        navigation.navigate('AdminSellerBasicInformation', {

          sellerId,

          initialSeller: displaySeller,

        });

        return;

      }



      if (isEditableSection(sectionId)) {

        navigation.navigate('AdminSellerSection', {

          sellerId,

          sectionId,

          initialSeller: displaySeller,

        });

      }

    },

    [initialSeller, navigation, seller, sellerId],

  );



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  const displaySeller = seller ?? initialSeller;



  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}

      refreshControl={

        <RefreshControl

          refreshing={isRefreshing}

          onRefresh={() => void refresh()}

          tintColor={colors.primary}

        />

      }

    >

      {error && !displaySeller ? (

        <ErrorState message={error} onAction={() => void refresh()} />

      ) : null}



      {displaySeller ? (

        <AppCard style={styles.identityCard}>

          <AppText variant="h3">{getAdminSellerDisplayName(displaySeller)}</AppText>

          <AppText variant="bodyMedium" color="textSecondary">

            {displaySeller.email ?? 'No email'}

          </AppText>

          {displaySeller.uuid ? (

            <AppText variant="caption" color="textMuted">

              {displaySeller.uuid}

            </AppText>

          ) : null}



          <View style={styles.statusRow}>

            <View style={styles.statusGroup}>

              <AppText variant="caption" color="textMuted">

                Approval status

              </AppText>

              <AppBadge

                label={formatAdminSellerApprovalStatus(displaySeller.status)}

                variant={approvalStatusBadgeVariant(displaySeller.status)}

              />

            </View>



            <View style={styles.statusGroup}>

              <AppText variant="caption" color="textMuted">

                Shop visibility

              </AppText>

              <AppBadge

                label={getAdminSellerShopVisibilityLabel(displaySeller)}

                variant={shopVisibilityBadgeVariant(displaySeller)}

              />

            </View>

          </View>



          {isLoading ? (

            <View style={styles.inlineLoading}>

              <ActivityIndicator size="small" color={colors.primary} />

              <AppText variant="caption" color="textSecondary">

                Refreshing seller details...

              </AppText>

            </View>

          ) : null}



          {error ? (

            <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />

          ) : null}

        </AppCard>

      ) : isLoading ? (

        <View style={styles.centeredLoading}>

          <ActivityIndicator size="small" color={colors.primary} />

          <AppText variant="bodySmall" color="textSecondary">

            Loading seller...

          </AppText>

        </View>

      ) : null}



      <View style={styles.sectionsBlock}>

        <AppText variant="label" color="textSecondary">

          Seller sections

        </AppText>



        {ADMIN_SELLER_DETAIL_SECTIONS.map((section, index) => (

          <Pressable

            key={section.id}

            accessibilityRole="button"

            onPress={() => handleSectionPress(section.id)}

            style={({ pressed }) => [

              styles.sectionRow,

              index === ADMIN_SELLER_DETAIL_SECTIONS.length - 1 && styles.sectionRowLast,

              pressed && styles.pressed,

            ]}

          >

            <View style={styles.sectionCopy}>

              <AppText variant="bodyMedium">{section.label}</AppText>

              <AppText variant="caption" color="textMuted">

                View & edit

              </AppText>

            </View>

            <AppText variant="bodySmall" color="textMuted">

              ›

            </AppText>

          </Pressable>

        ))}

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

    padding: spacing.lg,

    gap: spacing.lg,

  },

  identityCard: {

    gap: spacing.sm,

  },

  statusRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: spacing.lg,

    marginTop: spacing.sm,

  },

  statusGroup: {

    gap: spacing.xs,

  },

  inlineLoading: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    marginTop: spacing.sm,

  },

  inlineError: {

    marginTop: spacing.sm,

  },

  centeredLoading: {

    alignItems: 'center',

    gap: spacing.sm,

    paddingVertical: spacing.xl,

  },

  sectionsBlock: {

    gap: spacing.sm,

  },

  sectionRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.borderStrong,

    borderRadius: 12,

    paddingHorizontal: spacing.lg,

    paddingVertical: spacing.md,

    gap: spacing.md,

  },

  sectionRowLast: {

    marginBottom: 0,

  },

  sectionCopy: {

    flex: 1,

    gap: spacing.xs,

  },

  pressed: {

    opacity: 0.9,

  },

});


