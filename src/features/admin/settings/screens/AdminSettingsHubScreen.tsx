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

import { AdminSettingsHubSection } from '../components/AdminSettingsHubSection';

import { useAdminSettingsHubSummary } from '../hooks/useAdminSettingsHubSummary';

import {

  ADMIN_SETTINGS_HUB_SECTIONS,

  resolveAdminSettingsHubMeta,

} from '../utils/adminSettingsHubConfig';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsHub'>;



const RETURN_TO = authReturnTo.adminSettingsHub();

const SKELETON_ITEMS = ['s1', 's2', 's3', 's4', 's5'] as const;



export function AdminSettingsHubScreen({ navigation }: Props) {

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



  const showSkeletonCards = summary.isLoading && !summary.isRefreshing;



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

      {showSkeletonCards ? (

        <View style={styles.skeletonList}>

          {SKELETON_ITEMS.map((key) => (

            <AdminSettingsHubCardSkeleton key={key} />

          ))}

        </View>

      ) : (

        ADMIN_SETTINGS_HUB_SECTIONS.map((section) => (

          <AdminSettingsHubSection key={section.id} title={section.title}>

            <View style={styles.cardList}>

              {section.items.map((item) => (

                <AdminSettingsHubCard

                  key={item.id}

                  title={item.title}

                  icon={item.icon}

                  accentColor={item.accentColor}

                  meta={resolveAdminSettingsHubMeta(item.metaKey, summary)}

                  onPress={() => navigation.navigate(item.screen)}

                />

              ))}

            </View>

          </AdminSettingsHubSection>

        ))

      )}

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

    gap: spacing.xl,

  },

  cardList: {

    gap: spacing.md,

  },

  skeletonList: {

    gap: spacing.md,

  },

});

