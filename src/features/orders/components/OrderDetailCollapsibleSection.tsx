import type { ReactNode } from 'react';
import { useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ChevronExpandIcon } from '../../../components/ui/ChevronExpandIcon';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';

interface OrderDetailCollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  initiallyExpanded?: boolean;
  collapsedPreview?: ReactNode;
  variant?: 'default' | 'primary';
}

export function OrderDetailCollapsibleSection({
  title,
  icon,
  children,
  initiallyExpanded = false,
  collapsedPreview,
  variant = 'default',
}: OrderDetailCollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const isPrimary = variant === 'primary';

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => !current);
  };

  return (
    <View
      style={[
        styles.section,
        isPrimary ? styles.sectionPrimary : null,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggle}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed,
        ]}
      >
        <View style={[styles.iconWrap, isPrimary && styles.iconWrapPrimary]}>
          <Ionicons
            name={icon}
            size={18}
            color={isPrimary ? colors.primary : colors.textInverse}
          />
        </View>

        <AppText
          variant="bodyMedium"
          style={[styles.title, isPrimary && styles.titlePrimary]}
          numberOfLines={1}
        >
          {title}
        </AppText>

        <View style={styles.headerSpacer} />

        {!expanded && collapsedPreview ? (
          <View style={styles.preview}>{collapsedPreview}</View>
        ) : null}

        <ChevronExpandIcon
          expanded={expanded}
          color={isPrimary ? 'rgba(255,255,255,0.88)' : colors.textMuted}
          size={18}
        />
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
  sectionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  iconWrapPrimary: {
    backgroundColor: colors.surfaceWhite,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    flexShrink: 1,
  },
  titlePrimary: {
    color: colors.textInverse,
  },
  headerSpacer: {
    flex: 1,
    minWidth: spacing.sm,
  },
  preview: {
    flexShrink: 1,
    maxWidth: '38%',
    alignItems: 'flex-end',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
});
