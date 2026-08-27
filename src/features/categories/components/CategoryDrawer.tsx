import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ErrorState } from '../../../components/ecommerce';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import type { Category } from '../../../services/types/category';
import { useCategories } from '../hooks/useCategories';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import { navigateToParentCategory } from '../utils/subCategoryNavigation';

const DRAWER_MAX_WIDTH = 320;
const ANIMATION_MS = 220;

export interface CategoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: NativeStackNavigationProp<ShoppingStackParamList>;
}

export function CategoryDrawer({ visible, onClose, navigation }: CategoryDrawerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const drawerWidth = Math.min(windowWidth * 0.84, DRAWER_MAX_WIDTH);
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { categories, isLoading, error, retry } = useCategories();
  const navigableCategories = useMemo(() => getNavigableCategories(categories), [categories]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerWidth, fadeAnim, slideAnim, visible]);

  const handleCategoryPress = (category: Category) => {
    onClose();
    navigateToParentCategory(navigation, category);
  };

  const showBlockingError = Boolean(error) && navigableCategories.length === 0 && !isLoading;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close categories"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top + spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.md),
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <AppText variant="h3" style={styles.drawerTitle}>
              Categories
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close categories menu"
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {showBlockingError ? (
            <View style={styles.stateWrap}>
              <ErrorState message={error ?? 'Failed to load categories'} onAction={() => void retry()} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {error && navigableCategories.length > 0 ? (
                <Pressable style={styles.refreshBanner} onPress={() => void retry()}>
                  <AppText variant="bodySmall" color="error">
                    {error}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.refreshBannerAction}>
                    Retry
                  </AppText>
                </Pressable>
              ) : null}

              {navigableCategories.map((category) => {
                const categoryId = getCategoryRouteId(category);
                if (!categoryId) {
                  return null;
                }

                const categoryName = getCategoryDisplayName(category);

                return (
                  <Pressable
                    key={categoryId}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${categoryName}`}
                    onPress={() => handleCategoryPress(category)}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  >
                    <AppText variant="bodyMedium" style={styles.rowLabel}>
                      {categoryName}
                    </AppText>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  drawer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  drawerTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  rowLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stateWrap: {
    padding: spacing.lg,
  },
  refreshBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceMuted,
  },
  refreshBannerAction: {
    color: colors.textLink,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.92,
  },
});
