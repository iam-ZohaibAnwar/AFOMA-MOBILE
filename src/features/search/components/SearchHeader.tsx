import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import { colors, layout, radius, shadows, spacing } from '../../../design-system';

export interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  autoFocus?: boolean;
}

export function SearchHeader({
  value,
  onChangeText,
  onSubmit,
  onClear,
  showBackButton = false,
  onBackPress,
  autoFocus = true,
}: SearchHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {showBackButton ? (
        <HeaderBackButton onPress={onBackPress} />
      ) : null}

      <View style={styles.inputWrap}>
        <AppText variant="bodyMedium" color="textMuted" style={styles.searchIcon}>
          ⌕
        </AppText>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search products"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          accessibilityRole="search"
          accessibilityLabel="Search products"
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={onClear}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <AppText variant="bodyMedium" color="textMuted">
              ×
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  searchIcon: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchTarget - spacing.sm * 2,
    paddingVertical: Platform.OS === 'android' ? 0 : spacing.sm,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
