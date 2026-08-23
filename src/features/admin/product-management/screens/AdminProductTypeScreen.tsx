import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { AppButton } from '../../../../components/ui/AppButton';

import { AppCard } from '../../../../components/ui/AppCard';

import { AppText } from '../../../../components/ui/AppText';

import { colors, spacing } from '../../../../design-system';

import type { AdminStackParamList } from '../../navigation/adminTypes';

import { authReturnTo } from '../../../auth/utils/authNavigation';

import { useRequireAdmin } from '../../hooks/useRequireAdmin';

import { SellerProductTypeOption } from '../../../seller/products/components/SellerProductTypeOption';

import { navigateToAdminProductAiListing } from '../utils/adminProductAiListingNavigation';



type Props = NativeStackScreenProps<AdminStackParamList, 'AdminProductType'>;



const RETURN_TO = authReturnTo.adminProductManagement();



export function AdminProductTypeScreen({ navigation, route }: Props) {

  const insets = useSafeAreaInsets();

  const sellerId = route.params?.sellerId;

  const { isAuthorized } = useRequireAdmin(RETURN_TO);



  const handleSelectStandard = () => {

    navigation.navigate('AdminStandardProduct', sellerId ? { sellerId } : undefined);

  };



  const handleSelectDownloadable = () => {

    navigation.navigate('AdminDownloadableProduct', sellerId ? { sellerId } : undefined);

  };



  const handleSelectCustomizable = () => {

    navigation.navigate('AdminCustomizableProduct', sellerId ? { sellerId } : undefined);

  };



  const handleAiStandard = () => {

    navigateToAdminProductAiListing(navigation, 'Standard', sellerId);

  };



  const handleAiDownloadable = () => {

    navigateToAdminProductAiListing(navigation, 'Downloadable', sellerId);

  };



  const handleAiCustomizable = () => {

    navigateToAdminProductAiListing(navigation, 'Customizable', sellerId);

  };



  if (!isAuthorized) {

    return (

      <View style={styles.centeredState}>

        <ActivityIndicator size="large" color={colors.primary} />

      </View>

    );

  }



  return (

    <ScrollView

      style={styles.screen}

      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}

      showsVerticalScrollIndicator={false}

    >

      <View style={styles.intro}>

        <AppText variant="h3" style={styles.introTitle}>

          What are you listing?

        </AppText>

        <AppText variant="bodySmall" color="textSecondary">

          Choose the product type for the seller listing you are creating. AI listing prefills the

          wizard only — save still creates a Pending product.

        </AppText>

      </View>



      <AppCard variant="flat">

        <AppText variant="bodyMedium" style={styles.groupTitle}>

          Physical product

        </AppText>

        <AppText variant="bodySmall" color="textSecondary" style={styles.groupDescription}>

          Products that require physical delivery.

        </AppText>



        <View style={styles.options}>

          <SellerProductTypeOption

            title="Standard"

            description="A single item with one price and inventory."

            onPress={handleSelectStandard}

          />

          <AppButton label="Standard with AI photos" variant="outline" onPress={handleAiStandard} />

          <SellerProductTypeOption

            title="Customizable"

            description="A product with variations such as size, colour or material."

            onPress={handleSelectCustomizable}

          />

          <AppButton

            label="Customizable with AI photos"

            variant="outline"

            onPress={handleAiCustomizable}

          />

        </View>

      </AppCard>



      <AppCard variant="flat">

        <AppText variant="bodyMedium" style={styles.groupTitle}>

          Digital product

        </AppText>

        <AppText variant="bodySmall" color="textSecondary" style={styles.groupDescription}>

          Products delivered digitally.

        </AppText>



        <View style={styles.options}>

          <SellerProductTypeOption

            title="Downloadable"

            description="A digital file customers download after purchase."

            onPress={handleSelectDownloadable}

          />

          <AppButton

            label="Downloadable with AI photos"

            variant="outline"

            onPress={handleAiDownloadable}

          />

        </View>

      </AppCard>

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

  intro: {

    gap: spacing.sm,

  },

  introTitle: {

    color: colors.textPrimary,

  },

  groupTitle: {

    fontWeight: '700',

    color: colors.textPrimary,

    marginBottom: spacing.xs,

  },

  groupDescription: {

    marginBottom: spacing.md,

    lineHeight: 20,

  },

  options: {

    gap: spacing.md,

  },

  centeredState: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: colors.background,

  },

});


