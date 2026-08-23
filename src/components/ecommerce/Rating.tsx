import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, typography } from '../../design-system';

type RatingSize = 'sm' | 'md';

export interface RatingProps {
  value: number;
  maxStars?: number;
  size?: RatingSize;
  reviewCount?: number;
  showValue?: boolean;
  compactLabel?: boolean;
  starFilledColor?: string;
  starEmptyColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

function clampRating(value: number, maxStars: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(value, 0), maxStars);
}

function getStarGlyph(filled: boolean, half: boolean): string {
  if (filled) {
    return '★';
  }

  if (half) {
    return '⯨';
  }

  return '☆';
}

export function Rating({
  value,
  maxStars = 5,
  size = 'md',
  reviewCount,
  showValue = false,
  compactLabel = false,
  starFilledColor,
  starEmptyColor,
  textColor,
  style,
}: RatingProps) {
  const rating = clampRating(value, maxStars);
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const filledColor = starFilledColor ?? '#EAB308';
  const emptyColor = starEmptyColor ?? '#E2E8F0';
  const labelColor = textColor ?? '#475569';

  if (compactLabel && showValue) {
    return (
      <View style={[styles.row, style]} accessibilityRole="text">
        <View style={styles.stars}>
          {Array.from({ length: maxStars }, (_, index) => {
            const filled = index < fullStars;
            const half = !filled && hasHalf && index === fullStars;

            return (
              <Text
                key={index}
                style={[
                  styles.star,
                  styles[`star_${size}`],
                  { color: filled || half ? filledColor : emptyColor },
                ]}
              >
                {getStarGlyph(filled, half)}
              </Text>
            );
          })}
        </View>
        <Text style={[styles.compactLabel, styles[`value_${size}`], { color: labelColor }]}>
          {rating.toFixed(1)}
          {reviewCount !== undefined ? ` • ${reviewCount} reviews` : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, style]} accessibilityRole="text">
      <View style={styles.stars}>
        {Array.from({ length: maxStars }, (_, index) => {
          const filled = index < fullStars;
          const half = !filled && hasHalf && index === fullStars;

          return (
            <Text
              key={index}
              style={[
                styles.star,
                styles[`star_${size}`],
                { color: filled || half ? filledColor : emptyColor },
              ]}
            >
              {getStarGlyph(filled, half)}
            </Text>
          );
        })}
      </View>
      {showValue ? (
        <Text style={[styles.value, styles[`value_${size}`], { color: labelColor }]}>
          {rating.toFixed(1)}
        </Text>
      ) : null}
      {reviewCount !== undefined ? (
        <Text style={[styles.count, styles[`count_${size}`], { color: labelColor }]}>
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    color: '#E2E8F0',
  },
  star_sm: {
    fontSize: 12,
    lineHeight: 14,
  },
  star_md: {
    fontSize: 14,
    lineHeight: 16,
  },
  value: {
    ...typography.caption,
    fontWeight: '600',
  },
  compactLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
  },
  value_sm: {
    fontSize: 11,
  },
  value_md: {
    fontSize: 12,
  },
  count: {
    ...typography.caption,
  },
  count_sm: {
    fontSize: 11,
  },
  count_md: {
    fontSize: 12,
  },
});
