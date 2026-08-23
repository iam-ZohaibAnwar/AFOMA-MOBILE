import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, layout, spacing } from '../../../design-system';

export interface CategoryBrowseRowProps {
  label: string;
  onPress: () => void;
}

export function CategoryBrowseRow({ label, onPress }: CategoryBrowseRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Browse ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <AppText variant="bodyMedium" style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
      <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: layout.minTouchTarget,
    paddingVertical: spacing.sm,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.88,
  },
});
