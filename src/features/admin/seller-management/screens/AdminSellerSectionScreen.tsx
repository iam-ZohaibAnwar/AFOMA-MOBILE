import { useCallback, useLayoutEffect } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { colors, spacing } from '../../../../design-system';
import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminSellerSectionReadOnly } from '../components/AdminSellerSectionReadOnly';
import { useAdminSellerDetail } from '../hooks/useAdminSellerDetail';
import { getAdminSellerSectionTitle } from '../utils/adminSellerSectionForms';

const SECTION_ICONS = {
  address: 'location-outline',
  'shop-details': 'storefront-outline',
  'payment-information': 'card-outline',
  'shop-policies': 'document-text-outline',
} as const;

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSellerSection'>;

export function AdminSellerSectionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { sellerId, sectionId, initialSeller } = route.params;
  const returnTo = authReturnTo.adminSellerSection(sellerId, sectionId, initialSeller);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const sectionTitle = getAdminSellerSectionTitle(sectionId);

  const { seller, isRefreshing, error, refresh, syncSessionPatch } = useAdminSellerDetail(
    isAuthorized ? sellerId : undefined,
    initialSeller,
  );

  useFocusEffect(
    useCallback(() => {
      syncSessionPatch();
    }, [syncSessionPatch]),
  );

  const displaySeller = seller ?? initialSeller;

  const handleEditPress = useCallback(() => {
    if (!displaySeller) {
      return;
    }

    navigation.navigate('AdminSellerSectionEdit', {
      sellerId,
      sectionId,
      initialSeller: displaySeller,
    });
  }, [displaySeller, navigation, sectionId, sellerId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${sectionTitle}`}
          onPress={handleEditPress}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [handleEditPress, navigation, sectionTitle]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

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
        <View style={styles.cards}>
          <AdminProductDetailCardShell
            title={sectionTitle}
            icon={SECTION_ICONS[sectionId]}
            iconVariant="solid"
          >
            <AdminSellerSectionReadOnly sectionId={sectionId} seller={displaySeller} />
          </AdminProductDetailCardShell>

          {error ? (
            <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
          ) : null}
        </View>
      ) : null}
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
    gap: spacing.md,
  },
  cards: {
    gap: spacing.md,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
  headerAction: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
