import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Skeleton } from '../../../components/ecommerce';
import { spacing } from '../../../design-system';

export interface ProductGridSkeletonProps {
  columns?: number;
  count?: number;
  horizontalPadding?: number;
  gap?: number;
}

export function ProductGridSkeleton({
  columns = 2,
  count = 6,
  horizontalPadding = 16,
  gap = 12,
}: ProductGridSkeletonProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - horizontalPadding * 2 - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { paddingHorizontal: horizontalPadding, gap }]}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`product-grid-skeleton-${index}`}
          variant="productCard"
          style={{ width: cardWidth }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
