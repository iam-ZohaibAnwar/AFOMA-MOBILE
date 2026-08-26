import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface CategoryLinkOption {
  id: string;
  label: string;
}

export interface CategoryLinkBarProps {
  title?: string;
  links: CategoryLinkOption[];
  onLinkPress: (linkId: string, label: string) => void;
}

export function CategoryLinkBar({ title, links, onLinkPress }: CategoryLinkBarProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {title ? (
        <AppText variant="bodySmall" color="textMuted" style={styles.title}>
          {title}
        </AppText>
      ) : null}
      {links.map((link) => (
        <Pressable
          key={link.id}
          accessibilityRole="button"
          accessibilityLabel={`Browse ${link.label}`}
          onPress={() => onLinkPress(link.id, link.label)}
          style={({ pressed }) => [styles.linkButton, pressed && styles.linkPressed]}
        >
          <AppText variant="bodyMedium" style={styles.linkLabel}>
            {link.label}
          </AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    marginRight: spacing.xs,
  },
  linkButton: {
    paddingVertical: spacing.xs,
  },
  linkLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  linkPressed: {
    opacity: 0.88,
  },
});
