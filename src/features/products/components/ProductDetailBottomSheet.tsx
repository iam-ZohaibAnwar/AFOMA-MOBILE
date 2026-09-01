import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '../../../components/ui/BottomSheet';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import { PRODUCT_DETAIL_SECTION_TITLE_WEIGHT } from '../components/ProductDetailDescriptionContent';

export interface ProductDetailBottomSheetProps {
  visible: boolean;
  title: string;
  theme: PdpTheme;
  onClose: () => void;
  children: ReactNode;
}

export function ProductDetailBottomSheet({
  visible,
  title,
  theme,
  onClose,
  children,
}: ProductDetailBottomSheetProps) {
  const header = (
    <View style={styles.headerRow}>
      <AppText
        variant="h3"
        style={[styles.title, PRODUCT_DETAIL_SECTION_TITLE_WEIGHT, { color: theme.textPrimary }]}
      >
        {title}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '700' }}>
          ✕
        </AppText>
      </Pressable>
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={header}
      maxHeightRatio={0.85}
      chromeHeight={72}
      backgroundColor={theme.surface}
      contentContainerStyle={styles.content}
    >
      {children}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    flex: 1,
    ...PRODUCT_DETAIL_SECTION_TITLE_WEIGHT,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.88,
  },
});
