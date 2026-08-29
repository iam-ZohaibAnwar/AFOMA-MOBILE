import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { adminDashboardTheme } from '../utils/adminDashboardTheme';

export interface AdminSectionTitleProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showIcon?: boolean;
  trailing?: ReactNode;
}

export function AdminSectionTitle({
  title,
  icon,
  showIcon = Boolean(icon),
  trailing,
}: AdminSectionTitleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.leading}>
        {showIcon && icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={adminDashboardTheme.kpiIconColor} />
          </View>
        ) : null}
        <AppText variant="bodyMedium" style={styles.title}>
          {title}
        </AppText>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: adminDashboardTheme.kpiIconBackground,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 17,
  },
});
