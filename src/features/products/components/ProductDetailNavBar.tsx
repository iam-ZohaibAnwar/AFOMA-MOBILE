import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { MessageIcon } from '../../../components/ui/MessageIcon';
import { ShareIcon } from '../../../components/ui/ShareIcon';
import { layout, spacing } from '../../../design-system';
import { usePdpTheme } from '../../../design-system/pdpTheme';

export interface ProductDetailNavBarProps {
  title?: string;
  onBackPress: () => void;
  onSharePress?: () => void;
  onMessagePress?: () => void;
}

export function ProductDetailNavBar({
  title = 'Product Detail',
  onBackPress,
  onSharePress,
  onMessagePress,
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

      <View style={styles.actions}>
        {onMessagePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Message seller"
            onPress={onMessagePress}
            hitSlop={8}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <MessageIcon color={theme.textPrimary} size={20} />
          </Pressable>
        ) : null}

        {onSharePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share product"
            onPress={onSharePress}
            hitSlop={8}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
          >
            <ShareIcon color={theme.textPrimary} size={20} />
          </Pressable>
        ) : (
          <View style={styles.actionButton} accessibilityElementsHidden importantForAccessibility="no" />
        )}
      </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: -4,
  },
  actionButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
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
