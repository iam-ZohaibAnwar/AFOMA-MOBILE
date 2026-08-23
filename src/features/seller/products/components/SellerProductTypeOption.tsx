import { StyleSheet, View } from 'react-native';

import { PressableScale } from '../../../../components/motion/PressableScale';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';

export interface SellerProductTypeOptionProps {
  title: string;
  description: string;
  onPress: () => void;
}

export function SellerProductTypeOption({
  title,
  description,
  onPress,
}: SellerProductTypeOptionProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={styles.option}
    >
      <View style={styles.content}>
        <AppText variant="bodyMedium" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          {description}
        </AppText>
      </View>
      <AppText variant="bodyMedium" color="primary">
        ›
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
