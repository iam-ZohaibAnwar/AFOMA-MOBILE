import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface AccountMenuSectionProps {
  title: string;
  children: ReactNode;
}

export function AccountMenuSection({ title, children }: AccountMenuSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="label" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.panel}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
});
