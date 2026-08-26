import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface OrderListPaginationProps {
  currentPage: number;
  totalPages: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLoading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function OrderListPagination({
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  isLoading = false,
  onPrevious,
  onNext,
}: OrderListPaginationProps) {
  if (totalPages <= 1 && currentPage <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous page"
        onPress={onPrevious}
        disabled={!canGoPrevious}
        style={[styles.button, !canGoPrevious && styles.buttonDisabled]}
      >
        <AppText variant="bodySmall" color={canGoPrevious ? 'textLink' : 'textMuted'}>
          Previous
        </AppText>
      </Pressable>

      <View style={styles.pageMeta}>
        {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
        <AppText variant="bodySmall" color="textSecondary">
          Page {currentPage} of {totalPages}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next page"
        onPress={onNext}
        disabled={!canGoNext}
        style={[styles.button, !canGoNext && styles.buttonDisabled]}
      >
        <AppText variant="bodySmall" color={canGoNext ? 'textLink' : 'textMuted'}>
          Next
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 88,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
