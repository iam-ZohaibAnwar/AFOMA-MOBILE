import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface SearchSuggestionsSectionProps {
  suggestions: string[];
  onSelect: (term: string) => void;
}

export function SearchSuggestionsSection({
  suggestions,
  onSelect,
}: SearchSuggestionsSectionProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.title}>
        Suggestions
      </AppText>
      {suggestions.map((term) => (
        <Pressable
          key={term}
          accessibilityRole="button"
          onPress={() => onSelect(term)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <AppText variant="bodyMedium" color="textMuted" style={styles.icon}>
            ⌕
          </AppText>
          <AppText variant="bodyMedium" style={styles.label}>
            {term}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  icon: {
    width: 24,
    textAlign: 'center',
    fontSize: 16,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.9,
  },
});
