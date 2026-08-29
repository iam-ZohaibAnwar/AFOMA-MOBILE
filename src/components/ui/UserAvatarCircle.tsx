import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from './AppText';
import { colors, layout, radius } from '../../design-system';
import type { AuthUser } from '../../features/auth/types';
import {
  getUserAvatarLabel,
  getUserProfileImageUrl,
} from '../../features/account/utils/accountDisplay';

export interface UserAvatarCircleProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  size?: number;
  variant?: 'default' | 'solid';
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function UserAvatarCircle({
  user,
  isAuthenticated,
  size = layout.minTouchTarget,
  variant = 'default',
  onPress,
  accessibilityLabel = 'Open account',
  style,
}: UserAvatarCircleProps) {
  const profileImageUrl = isAuthenticated ? getUserProfileImageUrl(user) : undefined;
  const avatarLabel = getUserAvatarLabel(user, isAuthenticated);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [profileImageUrl]);

  const showImage = Boolean(profileImageUrl) && !imageFailed;
  const initialsFontSize = avatarLabel.length > 1 ? 12 : 16;
  const isSolid = variant === 'solid';
  const placeholderIconSize = Math.round(size * 0.42);

  const content = (
    <View
      style={[
        styles.circle,
        isSolid ? styles.circleSolid : styles.circleDefault,
        {
          width: size,
          height: size,
          borderRadius: isSolid ? radius.medium : size / 2,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: profileImageUrl }}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius: isSolid ? radius.medium : size / 2,
            },
          ]}
          accessibilityIgnoresInvertColors
          onError={() => setImageFailed(true)}
        />
      ) : isSolid ? (
        <Ionicons name="person-outline" size={placeholderIconSize} color={colors.textInverse} />
      ) : (
        <AppText
          variant="bodyMedium"
          color="primary"
          style={[styles.initials, { fontSize: initialsFontSize, lineHeight: initialsFontSize + 2 }]}
        >
          {avatarLabel}
        </AppText>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circleDefault: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.primarySoft,
  },
  circleSolid: {
    backgroundColor: colors.primary,
  },
  image: {
    backgroundColor: colors.surfaceMuted,
  },
  initials: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
