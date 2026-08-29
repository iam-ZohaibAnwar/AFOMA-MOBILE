import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { AppButton } from '../../../components/ui/AppButton';
import { UserAvatarCircle } from '../../../components/ui/UserAvatarCircle';
import { colors, radius, spacing } from '../../../design-system';
import type { AuthUser } from '../../auth/types';
import {
  formatAccountTenure,
  getAccountDisplayName,
  getAccountEmail,
  getUserProfileImageUrl,
} from '../utils/accountDisplay';

export interface AccountProfileHeaderProps {
  user: AuthUser | null;
  isAuthenticated?: boolean;
  memberSince?: string;
  isPhotoUploading?: boolean;
  onAvatarPress?: (options: { onViewPhoto?: () => void }) => void;
}

export function AccountProfileHeader({
  user,
  isAuthenticated = Boolean(user),
  memberSince,
  isPhotoUploading = false,
  onAvatarPress,
}: AccountProfileHeaderProps) {
  const tenureLabel = formatAccountTenure(memberSince);
  const profileImageUrl = getUserProfileImageUrl(user);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleAvatarPress = () => {
    if (!onAvatarPress) {
      return;
    }

    onAvatarPress({
      onViewPhoto: profileImageUrl ? () => setIsPreviewVisible(true) : undefined,
    });
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.avatarWrap}>
          <UserAvatarCircle
            user={user}
            isAuthenticated={isAuthenticated}
            size={64}
            variant="solid"
            onPress={onAvatarPress ? handleAvatarPress : undefined}
            accessibilityLabel="Profile photo"
          />
          {isPhotoUploading ? (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="small" color={colors.textInverse} />
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <AppText variant="h3" style={styles.name}>
            {getAccountDisplayName(user)}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {getAccountEmail(user)}
          </AppText>
          {tenureLabel ? (
            <AppText variant="bodySmall" color="textSecondary">
              {tenureLabel}
            </AppText>
          ) : null}
        </View>
      </View>

      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.previewBackdrop}>
          <View style={styles.previewCard}>
            <AppText variant="h3" style={styles.previewTitle}>
              Profile photo
            </AppText>

            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.previewImage} resizeMode="cover" />
            ) : null}

            <View style={styles.previewActions}>
              <AppButton
                label="Change photo"
                variant="outline"
                onPress={() => {
                  setIsPreviewVisible(false);
                  handleAvatarPress();
                }}
              />
              <AppButton label="Close" onPress={() => setIsPreviewVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.medium,
    backgroundColor: 'rgba(29, 78, 111, 0.72)',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  previewCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewTitle: {
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceMuted,
  },
  previewActions: {
    gap: spacing.sm,
  },
});
