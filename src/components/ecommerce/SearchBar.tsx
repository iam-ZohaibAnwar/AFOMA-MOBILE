import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, layout, radius, shadows, spacing } from '../../design-system';

type SearchBarMode = 'button' | 'input';

interface SearchBarBaseProps {
  placeholder?: string;
  mode?: SearchBarMode;
  style?: StyleProp<ViewStyle>;
}

interface SearchBarButtonProps extends SearchBarBaseProps {
  mode?: 'button';
  onPress: () => void;
  value?: never;
  onChangeText?: never;
  onSubmit?: never;
  inputProps?: never;
}

interface SearchBarInputProps extends SearchBarBaseProps {
  mode: 'input';
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onPress?: never;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'style'>;
}

export type SearchBarProps = SearchBarButtonProps | SearchBarInputProps;

export function SearchBar(props: SearchBarProps) {
  const {
    placeholder = 'Search products',
    mode = 'button',
    style,
  } = props;

  if (mode === 'input') {
    const { value, onChangeText, onSubmit, inputProps } = props;

    return (
      <View style={[styles.container, style]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          {...inputProps}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Submit search"
          onPress={onSubmit}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
        >
          <AppText variant="button" color="textInverse" style={styles.submitLabel}>
            Search
          </AppText>
        </Pressable>
      </View>
    );
  }

  const { onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={placeholder}
      onPress={onPress}
      style={({ pressed }) => [styles.buttonContainer, pressed && styles.pressed, style]}
    >
      <AppText variant="bodyMedium" color="textSubtle" style={styles.searchIcon}>
        ⌕
      </AppText>
      <AppText variant="body" color="textSubtle" style={styles.placeholder}>
        {placeholder}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.minTouchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  input: {
    flex: 1,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 15,
  },
  submitButton: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.small,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    fontSize: 14,
  },
  searchIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    flex: 1,
  },
  pressed: {
    opacity: 0.94,
  },
});
