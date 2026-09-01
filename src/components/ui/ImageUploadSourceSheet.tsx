import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing } from '../../design-system';

export interface ImageUploadSourceAction {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  destructive?: boolean;
  onPress: () => void;
}

export interface ImageUploadSourceSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  actions: ImageUploadSourceAction[];
  onClose: () => void;
}

export function ImageUploadSourceSheet({
  visible,
  title,
  subtitle,
  actions,
  onClose,
}: ImageUploadSourceSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      scrollable={false}
      maxHeightRatio={0.52}
      chromeHeight={96}
      header={
        <View style={styles.header}>
          <AppText variant="h3" style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      }
    >
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.actionRow,
              pressed && styles.actionRowPressed,
            ]}
          >
            {action.icon ? (
              <View style={[styles.iconWrap, action.destructive && styles.iconWrapDestructive]}>
                <Ionicons
                  name={action.icon}
                  size={18}
                  color={action.destructive ? colors.error : colors.primary}
                />
              </View>
            ) : null}
            <AppText
              variant="bodyMedium"
              color={action.destructive ? 'error' : 'textPrimary'}
              style={styles.actionLabel}
            >
              {action.label}
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  actionRowPressed: {
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  iconWrapDestructive: {
    backgroundColor: colors.errorBg,
  },
  actionLabel: {
    flex: 1,
    fontWeight: '600',
  },
});
