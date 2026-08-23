import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface SearchTrendingSectionProps {
  terms: readonly string[];
  onSelect: (term: string) => void;
}

export function SearchTrendingSection({ terms, onSelect }: SearchTrendingSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.title}>
        Trending now
      </AppText>
      <View style={styles.chips}>
        {terms.map((term) => (
          <Pressable
            key={term}
            accessibilityRole="button"
            onPress={() => onSelect(term)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
          >
            <AppText variant="bodyMedium" style={styles.chipLabel}>
              {term}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.92,
  },
});
