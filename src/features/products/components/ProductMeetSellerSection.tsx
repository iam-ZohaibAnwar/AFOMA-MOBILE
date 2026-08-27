import { StyleSheet, View } from 'react-native';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { radius, shadows, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import { ProductSellerSection } from './ProductSellerSection';

export interface ProductMeetSellerSectionProps {
  sellerName: string;
  sellerLogoUrl?: string;
  theme: PdpTheme;
  onVisitShop?: () => void;
  onMessageSeller?: () => void;
}

export function ProductMeetSellerSection({
  sellerName,
  sellerLogoUrl,
  theme,
  onVisitShop,
  onMessageSeller,
}: ProductMeetSellerSectionProps) {
  return (
    <View style={[styles.section, { borderTopColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
      <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
        Meet your seller
      </AppText>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.card]}>
        <ProductSellerSection
          embedded
          sellerName={sellerName}
          sellerLogoUrl={sellerLogoUrl}
          onPress={onVisitShop}
        />

        {onVisitShop ? (
          <AppButton
            label="Visit shop"
            variant="outline"
            shape="pill"
            fullWidth
            onPress={onVisitShop}
            style={styles.visitButton}
          />
        ) : null}

        {onMessageSeller ? (
          <AppButton
            label="Message seller"
            variant="outline"
            shape="pill"
            fullWidth
            onPress={onMessageSeller}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontWeight: '700',
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    gap: spacing.md,
  },
  visitButton: {
    marginTop: spacing.xs,
  },
});
