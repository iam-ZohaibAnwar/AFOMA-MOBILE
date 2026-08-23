import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface SearchRecentSectionProps {
  recentSearches: string[];
  onSelect: (term: string) => void;
  onRemove: (term: string) => void;
  onClearAll: () => void;
}

export function SearchRecentSection({
  recentSearches,
  onSelect,
  onRemove,
  onClearAll,
}: SearchRecentSectionProps) {
  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="h3">Recent searches</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={onClearAll}
          style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
        >
          <AppText variant="bodyMedium" color="textLink">
            Clear
          </AppText>
        </Pressable>
      </View>

      {recentSearches.map((term) => (
        <View key={term} style={styles.row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelect(term)}
            style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
          >
            <AppText variant="bodyMedium" color="textMuted" style={styles.icon}>
              ◷
            </AppText>
            <AppText variant="bodyMedium" style={styles.label}>
              {term}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${term}`}
            onPress={() => onRemove(term)}
            style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
          >
            <AppText variant="bodyMedium" color="textMuted">
              ×
            </AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  clearButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowMain: {
    flex: 1,
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
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
