import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppInput, type AppInputProps } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface AdminPasswordFieldProps extends Omit<AppInputProps, 'secureTextEntry'> {
  label: string;
}

export function AdminPasswordField({ label, tone = 'default', style, ...inputProps }: AdminPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <AppInput
        {...inputProps}
        label={label}
        tone={tone}
        secureTextEntry={!isVisible}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isVisible ? 'Hide password' : 'Show password'}
        onPress={() => setIsVisible((current) => !current)}
        style={styles.toggle}
      >
        <AppText variant="caption" color="textLink">
          {isVisible ? 'Hide' : 'Show'}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    paddingRight: spacing.xxl + spacing.md,
  },
  toggle: {
    position: 'absolute',
    right: spacing.md,
    top: 38,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
});
