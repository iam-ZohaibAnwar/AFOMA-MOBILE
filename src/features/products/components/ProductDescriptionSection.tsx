import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

const COLLAPSED_LINES = 4;

export interface ProductDescriptionSectionProps {
  description: string;
}

export function ProductDescriptionSection({ description }: ProductDescriptionSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = description.trim();

  if (!trimmed) {
    return null;
  }

  const isLong = trimmed.length > 180;

  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.heading}>
        Description
      </AppText>
      <AppText
        variant="body"
        color="textSecondary"
        style={styles.body}
        numberOfLines={expanded || !isLong ? undefined : COLLAPSED_LINES}
      >
        {trimmed}
      </AppText>
      {isLong ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less description' : 'Read more description'}
          onPress={() => setExpanded((current) => !current)}
          style={({ pressed }) => [styles.readMoreButton, pressed && styles.pressed]}
        >
          <AppText variant="bodyMedium" color="textLink">
            {expanded ? 'Show less' : 'Read more'}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.textPrimary,
  },
  body: {
    lineHeight: 22,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.88,
  },
});
