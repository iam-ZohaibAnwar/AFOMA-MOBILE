import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronExpandIcon } from '../../../components/ui/ChevronExpandIcon';
import { ChevronForwardIcon } from '../../../components/ui/ChevronForwardIcon';
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
  const accentColor = expanded ? colors.primary : colors.textMuted;
  const rowPadding = { paddingLeft: spacing.lg + depth * DEPTH_INDENT };

  const labelContent = (
    <View style={styles.labelWrap}>
      <AppText
        variant="bodyMedium"
        style={[styles.label, expanded && styles.labelExpanded]}
        numberOfLines={2}
      >
        {label}
      </AppText>
      {meta ? (
        <AppText variant="bodySmall" color="textMuted" style={styles.meta}>
          {meta}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <View>
      {!showChevron ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Browse ${label}`}
          onPress={onPress}
          style={({ pressed }) => [
            styles.row,
            depth > 0 && styles.rowNested,
            rowPadding,
            pressed && styles.rowPressed,
          ]}
        >
          <View style={styles.labelPressable}>{labelContent}</View>
          <View style={styles.trailingIcon}>
            <ChevronForwardIcon color={colors.textMuted} size={16} />
          </View>
        </Pressable>
      ) : (
        <View
          style={[
            styles.row,
            depth > 0 && styles.rowNested,
            expanded && styles.rowExpanded,
            rowPadding,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Browse ${label}`}
            accessibilityState={{ expanded }}
            onPress={onPress}
            style={({ pressed }) => [styles.labelPressable, pressed && styles.rowPressed]}
          >
            {labelContent}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? `Collapse ${label}` : `Expand ${label}`}
            accessibilityState={{ expanded }}
            onPress={handleChevronPress}
            hitSlop={8}
            style={({ pressed }) => [styles.chevronButton, pressed && styles.rowPressed]}
          >
            <ChevronExpandIcon expanded={expanded} color={accentColor} />
          </Pressable>
        </View>
      )}

      {!isLast ? <View style={[styles.divider, rowPadding]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingRight: spacing.sm,
    backgroundColor: colors.background,
  },
  rowNested: {
    backgroundColor: colors.background,
  },
  rowExpanded: {
    backgroundColor: colors.surfaceMuted,
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
  trailingIcon: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  labelExpanded: {
    color: colors.primary,
  },
  meta: {
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.border,
  },
});
