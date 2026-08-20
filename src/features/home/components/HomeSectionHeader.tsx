import { Pressable, StyleSheet, Text, View } from 'react-native';

import { homeColors, homeSpacing, homeTypography } from '../theme/homeTheme';

interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function HomeSectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: HomeSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={homeTypography.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={homeTypography.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable style={styles.actionButton} onPress={onActionPress} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: homeSpacing.screen,
    marginBottom: 16,
    gap: 12,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  actionButton: {
    paddingTop: 2,
  },
  action: {
    fontSize: 14,
    fontWeight: '700',
    color: homeColors.accent,
  },
});
