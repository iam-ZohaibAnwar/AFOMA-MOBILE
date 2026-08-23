import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export interface ProductAccordionProps {
  title: string;
  children: ReactNode;
  theme: PdpTheme;
  initiallyExpanded?: boolean;
}

export function ProductAccordion({
  title,
  children,
  theme,
  initiallyExpanded = false,
}: ProductAccordionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={{ color: theme.textPrimary, fontWeight: '700' }}>
          {title}
        </AppText>
        <AppText variant="bodyMedium" style={{ color: theme.textMuted }}>
          {expanded ? '⌃' : '⌄'}
        </AppText>
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.9,
  },
});
