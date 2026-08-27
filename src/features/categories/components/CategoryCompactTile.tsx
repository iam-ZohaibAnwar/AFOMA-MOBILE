import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { formatCategoryLabelLines } from '../utils/categoryNavigation';
import { BrowseCategoryCardImage } from './BrowseCategoryCardImage';

const COMPACT_IMAGE_SIZE = 52;
const LABEL_LINE_HEIGHT = 20;
const LABEL_MAX_LINES = 3;
const LABEL_BLOCK_HEIGHT = LABEL_LINE_HEIGHT * LABEL_MAX_LINES;

export type CategoryCompactTileVariant = 'category' | 'viewAll';

export interface CategoryCompactTileProps {
  label: string;
  slug?: string;
  width: number;
  variant?: CategoryCompactTileVariant;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CategoryCompactTile({
  label,
  slug,
  width,
  variant = 'category',
  onPress,
  style,
}: CategoryCompactTileProps) {
  const isViewAll = variant === 'viewAll';
  const displayLabel = isViewAll ? `View all ${label}` : label;
  const labelLines = useMemo(() => formatCategoryLabelLines(displayLabel, LABEL_MAX_LINES), [displayLabel]);
  const isSingleLine = labelLines.length === 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isViewAll ? `View all ${label}` : `Browse ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width },
        isViewAll && styles.viewAllTile,
        pressed && styles.pressed,
      ]}
    >
      {isViewAll ? (
        <View style={styles.viewAllBadge}>
          <AppText variant="caption" color="primary" style={styles.viewAllBadgeText}>
            All
          </AppText>
        </View>
      ) : (
        <BrowseCategoryCardImage name={label} slug={slug} size={COMPACT_IMAGE_SIZE} />
      )}

      <View
        style={[
          styles.labelWrap,
          {
            minHeight: isSingleLine ? COMPACT_IMAGE_SIZE : LABEL_BLOCK_HEIGHT,
          },
          isSingleLine ? styles.labelWrapSingle : styles.labelWrapMulti,
        ]}
      >
        {labelLines.map((line, index) => (
          <AppText
            key={`${line}-${index}`}
            variant="bodyMedium"
            numberOfLines={1}
            style={styles.labelLine}
          >
            {line}
          </AppText>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: COMPACT_IMAGE_SIZE + spacing.sm * 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.large,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
  },
  viewAllTile: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  viewAllBadge: {
    width: COMPACT_IMAGE_SIZE,
    height: COMPACT_IMAGE_SIZE,
    borderRadius: Math.round(COMPACT_IMAGE_SIZE * 0.22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    flexShrink: 0,
  },
  viewAllBadgeText: {
    fontWeight: '700',
  },
  labelWrap: {
    flex: 1,
    flexShrink: 1,
  },
  labelWrapSingle: {
    justifyContent: 'center',
  },
  labelWrapMulti: {
    justifyContent: 'flex-start',
  },
  labelLine: {
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: LABEL_LINE_HEIGHT,
  },
  pressed: {
    opacity: 0.94,
  },
});
