import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronExpandIcon } from '../../../components/ui/ChevronExpandIcon';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';

export interface ProductAccordionProps {
  title: string;
  children: ReactNode;
  theme: PdpTheme;
  initiallyExpanded?: boolean;
  renderHeaderMeta?: (expanded: boolean) => ReactNode | null;
}

export function ProductAccordion({
  title,
  children,
  theme,
  initiallyExpanded = false,
  renderHeaderMeta,
}: ProductAccordionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const headerMeta = renderHeaderMeta?.(expanded);

  return (
    <View style={[styles.container, { borderTopColor: theme.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <AppText variant="bodyMedium" style={[styles.title, { color: theme.textPrimary }]}>
          {title}
        </AppText>
        <View style={styles.headerSpacer} />
        {headerMeta ? <View style={styles.headerMeta}>{headerMeta}</View> : null}
        <ChevronExpandIcon expanded={expanded} color={theme.textMuted} size={18} />
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
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  title: {
    flexShrink: 1,
    fontWeight: '700',
  },
  headerSpacer: {
    flex: 1,
    minWidth: spacing.sm,
  },
  headerMeta: {
    flexShrink: 0,
  },
  body: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
});
