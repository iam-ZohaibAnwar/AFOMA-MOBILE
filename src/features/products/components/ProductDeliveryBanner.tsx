import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export interface ProductDeliveryBannerProps {
  message: string;
  theme: PdpTheme;
}

export function ProductDeliveryBanner({ message, theme }: ProductDeliveryBannerProps) {
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.deliveryBannerBg,
          borderColor: theme.deliveryBannerBorder,
        },
      ]}
    >
      <AppText variant="bodyMedium" style={{ color: theme.deliveryBannerIcon }}>
        🚚
      </AppText>
      <AppText variant="bodyMedium" style={[styles.message, { color: theme.deliveryBannerText }]}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  message: {
    flex: 1,
    fontWeight: '600',
  },
});
