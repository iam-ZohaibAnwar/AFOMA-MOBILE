import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { SELLER_PRODUCT_TYPE_LABELS } from '../products/types/sellerProductType';

type CustomizableProps = NativeStackScreenProps<SellerStackParamList, 'SellerCustomizableProduct'>;
type DownloadableProps = NativeStackScreenProps<SellerStackParamList, 'SellerDownloadableProduct'>;

type Props = CustomizableProps | DownloadableProps;

export function SellerCustomizableProductPlaceholderScreen(props: CustomizableProps) {
  return <SellerProductCreatePlaceholderScreen {...props} productType="Customizable" />;
}

export function SellerDownloadableProductPlaceholderScreen(props: DownloadableProps) {
  return <SellerProductCreatePlaceholderScreen {...props} productType="Downloadable" />;
}

interface PlaceholderContentProps {
  productType: keyof typeof SELLER_PRODUCT_TYPE_LABELS;
  navigation: Props['navigation'];
}

function SellerProductCreatePlaceholderScreen({
  productType,
  navigation,
}: PlaceholderContentProps) {
  const insets = useSafeAreaInsets();
  const label = SELLER_PRODUCT_TYPE_LABELS[productType];

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + spacing.xxl }]}>
      <AppCard variant="flat" style={styles.card}>
        <AppText variant="h3" style={styles.title}>
          {label}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.message}>
          The {label.toLowerCase()} form will be added in the next release.
        </AppText>
        <AppButton
          label="Back to products"
          variant="outline"
          onPress={() => navigation.navigate('SellerProducts')}
          style={styles.action}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  message: {
    lineHeight: 22,
  },
  action: {
    marginTop: spacing.sm,
  },
});
