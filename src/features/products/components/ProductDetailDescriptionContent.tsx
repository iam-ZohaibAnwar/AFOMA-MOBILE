import { StyleSheet, View, type TextStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing, typography } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export const PRODUCT_DETAIL_SECTION_TITLE_WEIGHT: TextStyle = {
  fontWeight: '700',
};

export function getProductDetailBodyTextStyle(theme: PdpTheme): TextStyle {
  return {
    ...(typography.body as TextStyle),
    color: theme.textSecondary,
  };
}

export function getProductDetailExpandActionTextStyle(theme: PdpTheme): TextStyle {
  return {
    ...(typography.bodyMedium as TextStyle),
    color: theme.textPrimary,
    fontWeight: '600',
  };
}

export interface ProductDetailDescriptionContentProps {
  description: string;
  theme: PdpTheme;
  numberOfLines?: number;
}

export function ProductDetailDescriptionContent({
  description,
  theme,
  numberOfLines,
}: ProductDetailDescriptionContentProps) {
  const trimmed = description.trim();
  const bodyStyle = getProductDetailBodyTextStyle(theme);

  if (!trimmed) {
    return (
      <AppText variant="body" style={bodyStyle}>
        No product details available yet.
      </AppText>
    );
  }

  if (numberOfLines != null) {
    return (
      <AppText variant="body" style={bodyStyle} numberOfLines={numberOfLines}>
        {trimmed}
      </AppText>
    );
  }

  const paragraphs = trimmed.split(/\n\n+/).filter(Boolean);

  return (
    <View style={styles.container}>
      {paragraphs.map((paragraph, index) => (
        <AppText key={`description-paragraph-${index}`} variant="body" style={bodyStyle}>
          {paragraph}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
