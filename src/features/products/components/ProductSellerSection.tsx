import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

export interface ProductSellerSectionProps {
  sellerName: string;
  sellerLogoUrl?: string;
  onPress?: () => void;
  embedded?: boolean;
}

function getSellerInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function ProductSellerSection({
  sellerName,
  sellerLogoUrl,
  onPress,
  embedded = false,
}: ProductSellerSectionProps) {
  const trimmed = sellerName.trim();

  if (!trimmed) {
    return null;
  }

  const content = (
    <>
      <View style={styles.avatar}>
        {sellerLogoUrl ? (
          <Image source={{ uri: sellerLogoUrl }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <AppText variant="label" style={styles.avatarInitials}>
            {getSellerInitials(trimmed)}
          </AppText>
        )}
      </View>

      <View style={styles.details}>
        <AppText variant="bodyMedium" style={styles.storeName} numberOfLines={1}>
          {trimmed}
        </AppText>
        <AppText variant="bodySmall" color="textMuted">
          {onPress ? 'Visit shop' : 'Marketplace seller'}
        </AppText>
      </View>

      {onPress ? (
        <AppText variant="bodyMedium" style={styles.chevron}>
          ›
        </AppText>
      ) : null}
    </>
  );

  const containerStyle = [styles.container, embedded ? styles.containerEmbedded : styles.containerStandalone];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Visit ${trimmed}`}
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  containerStandalone: {
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  containerEmbedded: {
    paddingVertical: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.borderForm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.88,
  },
});
