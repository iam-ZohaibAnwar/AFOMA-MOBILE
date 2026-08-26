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
  onChevronPress?: () => void;
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
  onChevronPress,
}: CategoryTreeRowProps) {
  const handleChevronPress = onChevronPress ?? onPress;

  return (
    <View>
      <View
        style={[
          styles.row,
          { paddingLeft: spacing.lg + depth * DEPTH_INDENT },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Browse ${label}`}
          accessibilityState={{ expanded }}
          onPress={onPress}
          style={({ pressed }) => [styles.labelPressable, pressed && styles.pressed]}
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
        </Pressable>

        {showChevron ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? `Collapse ${label}` : `Expand ${label}`}
            accessibilityState={{ expanded }}
            onPress={handleChevronPress}
            hitSlop={8}
            style={({ pressed }) => [styles.chevronButton, pressed && styles.pressed]}
          >
            <AppText variant="bodyMedium" color="textMuted" style={styles.chevron}>
              {expanded ? '⌃' : '⌄'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {!isLast ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  labelPressable: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  labelWrap: {
    gap: 2,
  },
  chevronButton: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
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
