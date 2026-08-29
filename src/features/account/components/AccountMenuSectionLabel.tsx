import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

export interface AccountMenuSectionLabelProps {
  title: string;
}

export function AccountMenuSectionLabel({ title }: AccountMenuSectionLabelProps) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.title}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xs,
  },
  title: {
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
