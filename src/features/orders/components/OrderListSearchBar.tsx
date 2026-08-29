import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, layout, radius, spacing } from '../../../design-system';

export interface OrderListSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function OrderListSearchBar({
  value,
  onChangeText,
  placeholder = 'Search orders...',
  accessibilityLabel,
  style,
}: OrderListSearchBarProps) {
  return (
    <View style={[styles.searchWrap, style]}>
      <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={styles.searchInput}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel={accessibilityLabel ?? placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouchTarget,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearButtonPressed: {
    opacity: 0.8,
  },
});
