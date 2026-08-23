import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface CategoryTreeRowProps {
  label: string;
  depth?: number;
  meta?: string;
  expanded?: boolean;
  showChevron?: boolean;
  isLast?: boolean;
  onPress: () => void;
}

const DEPTH_INDENT = 24;

export function CategoryTreeRow({
  label,
  depth = 0,
  meta,
  expanded = false,
  showChevron = true,
  isLast = false,
  onPress,
}: CategoryTreeRowProps) {
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Browse ${label}`}
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: spacing.lg + depth * DEPTH_INDENT },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.labelWrap}>
          <AppText variant="bodyMedium" style={styles.label} numberOfLines={2}>
            {label}
          </AppText>
          {meta ? (
            <AppText variant="bodySmall" color="textMuted" style={styles.meta}>
              {meta}
            </AppText>
          ) : null}
        </View>

        {showChevron ? (
          <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
            {expanded ? '⌄' : '›'}
          </AppText>
        ) : null}
      </Pressable>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 52,
    paddingRight: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  labelWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 24,
    minWidth: 16,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginLeft: spacing.lg,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: colors.surfaceMuted,
  },
});
