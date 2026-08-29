import { useCallback } from 'react';

import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFocusEffect } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { colors, spacing } from '../../../../design-system';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { AdminSettingsHubCard } from '../components/AdminSettingsHubCard';

import { AdminSettingsHubCardSkeleton } from '../components/AdminSettingsHubCardSkeleton';

import { useAdminSettingsHubSummary } from '../hooks/useAdminSettingsHubSummary';

import {

  ADMIN_COMMISSION_RATE_SETTING_TYPES,

  getAdminCommissionRateSettingLabel,

} from '../utils/adminSettingsContent';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsCommissionRates'>;



const RETURN_TO = authReturnTo.adminSettingsCommissionRates();



const COMMISSION_RATE_ICONS = {

  'affiliate-commission': 'people-outline',

  'seller-referral-commission': 'storefront-outline',

  'buyer-referral-commission': 'cart-outline',

} as const;



export function AdminSettingsCommissionRatesScreen({ navigation }: Props) {

  const insets = useSafeAreaInsets();

  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  const summary = useAdminSettingsHubSummary({ enabled: isAuthorized });



  useFocusEffect(

    useCallback(() => {

      if (isAuthorized) {

        void summary.refresh();

      }

    }, [isAuthorized, summary.refresh]),

  );



  if (!isAuthorized) {

    return <View style={[styles.screen, { paddingTop: insets.top }]} />;

  }



  const showSkeleton = summary.isLoading && !summary.isRefreshing;



  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={[

        styles.content,

        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },

      ]}

      showsVerticalScrollIndicator={false}

      refreshControl={

        <RefreshControl

          refreshing={summary.isRefreshing}

          onRefresh={() => void summary.refresh()}

          tintColor={colors.primary}

        />

      }

    >

      <View style={styles.cardList}>

        {showSkeleton

          ? ADMIN_COMMISSION_RATE_SETTING_TYPES.map((rateType) => (

              <AdminSettingsHubCardSkeleton key={rateType} />

            ))

          : ADMIN_COMMISSION_RATE_SETTING_TYPES.map((rateType) => (

              <AdminSettingsHubCard

                key={rateType}

                title={getAdminCommissionRateSettingLabel(rateType)}

                icon={COMMISSION_RATE_ICONS[rateType]}

                meta={summary.commissionRateCards[rateType]}

                onPress={() => navigation.navigate('AdminSettingsCommissionRate', { rateType })}

              />

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

    paddingHorizontal: spacing.lg,

    gap: spacing.md,

  },

  cardList: {

    gap: spacing.md,

  },

});

