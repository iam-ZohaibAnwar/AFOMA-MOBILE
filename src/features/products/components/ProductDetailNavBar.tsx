import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { ShareIcon } from '../../../components/ui/ShareIcon';
import { layout, spacing } from '../../../design-system';
import { usePdpTheme } from '../../../design-system/pdpTheme';

export interface ProductDetailNavBarProps {
  title?: string;
  onBackPress: () => void;
  onSharePress?: () => void;
}

export function ProductDetailNavBar({
  title = 'Product Detail',
  onBackPress,
  onSharePress,
}: ProductDetailNavBarProps) {
  const insets = useSafeAreaInsets();
  const theme = usePdpTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xs, backgroundColor: theme.background },
      ]}
    >
      <HeaderBackButton onPress={onBackPress} color={theme.textPrimary} />

      <AppText
        variant="bodyMedium"
        style={[styles.title, { color: theme.textPrimary }]}
        numberOfLines={1}
      >
        {title}
      </AppText>

      {onSharePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share product"
          onPress={onSharePress}
          hitSlop={8}
          style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}
        >
          <ShareIcon color={theme.textPrimary} size={20} />
        </Pressable>
      ) : (
        <View style={styles.sideButton} accessibilityElementsHidden importantForAccessibility="no" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sideButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
