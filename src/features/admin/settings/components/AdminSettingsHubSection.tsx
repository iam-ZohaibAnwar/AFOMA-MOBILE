import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';

export interface AdminSettingsHubSectionProps {
  title: string;
  children: ReactNode;
}

export function AdminSettingsHubSection({ title, children }: AdminSettingsHubSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="caption" color="textMuted" style={styles.title}>
        {title.toUpperCase()}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    letterSpacing: 0.8,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
});
