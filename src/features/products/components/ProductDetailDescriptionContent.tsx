import { StyleSheet } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export interface ProductDetailDescriptionContentProps {
  description: string;
  theme: PdpTheme;
}

export function ProductDetailDescriptionContent({
  description,
  theme,
}: ProductDetailDescriptionContentProps) {
  const trimmed = description.trim();

  if (!trimmed) {
    return (
      <AppText variant="bodySmall" style={{ color: theme.textSecondary }}>
        No product details available yet.
      </AppText>
    );
  }

  return (
    <AppText variant="bodySmall" style={[styles.body, { color: theme.textSecondary }]}>
      {trimmed}
    </AppText>
  );
}

const styles = StyleSheet.create({
  body: {
    lineHeight: 22,
  },
});
