import type { ReactNode } from 'react';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronExpandIcon } from '../../../../../components/ui/ChevronExpandIcon';
import { AppText } from '../../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../../design-system';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AdminProductCollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  initiallyExpanded?: boolean;
  collapsedPreview?: ReactNode;
}

export function AdminProductCollapsibleSection({
  title,
  icon,
  children,
  initiallyExpanded = false,
  collapsedPreview,
}: AdminProductCollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.textInverse} />
        </View>

        <AppText variant="bodyMedium" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>

        <View style={styles.headerSpacer} />

        {!expanded && collapsedPreview ? (
          <View style={styles.preview}>{collapsedPreview}</View>
        ) : null}

        <ChevronExpandIcon expanded={expanded} color={colors.textMuted} size={18} />
      </Pressable>

      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    flexShrink: 1,
  },
  headerSpacer: {
    flex: 1,
    minWidth: spacing.sm,
  },
  preview: {
    flexShrink: 1,
    maxWidth: '42%',
    alignItems: 'flex-end',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
