import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useSubCategoryBrowserSections } from '../hooks/useSubCategoryBrowserSections';
import {
  getCategoryDisplayName,
  getCategoryRouteId,
  getNavigableCategories,
} from '../utils/categoryNavigation';
import {
  navigateFromSubCategorySection,
  navigateFromSubCategorySectionChild,
} from '../utils/subCategoryNavigation';
import { CategoryTreeRow } from './CategoryTreeRow';

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

  const [expandedParentId, setExpandedParentId] = useState<string | null>(null);
  const [expandedSubKey, setExpandedSubKey] = useState<string | null>(null);

  const { sections, error: sectionsError, retry: retrySections } =
    useSubCategoryBrowserSections(expandedParentId ?? '', Boolean(expandedParentId));

  useEffect(() => {
    if (!visible) {
      setExpandedParentId(null);
      setExpandedSubKey(null);
    }
  }, [visible]);

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

  const closeAndRun = (action: () => void) => {
    onClose();
    action();
  };

  const handleParentBrowse = (category: Category) => {
    const categoryId = getCategoryRouteId(category);
    if (!categoryId) {
      return;
    }

    const categoryName = getCategoryDisplayName(category);
    closeAndRun(() => {
      navigation.navigate('SubCategories', { categoryId, categoryName });
    });
  };

  const handleParentExpand = (categoryId: string) => {
    setExpandedSubKey(null);
    setExpandedParentId((current) => (current === categoryId ? null : categoryId));
  };

  const handleSubBrowse = (
    categoryId: string,
    categoryName: string,
    subCategory: Category,
  ) => {
    closeAndRun(() => {
      navigateFromSubCategorySection(navigation, {
        categoryId,
        categoryName,
        subCategory,
      });
    });
  };

  const handleChildBrowse = (
    categoryId: string,
    categoryName: string,
    subCategory: Category,
    childCategory: Category,
  ) => {
    closeAndRun(() => {
      navigateFromSubCategorySectionChild(navigation, {
        categoryId,
        categoryName,
        subCategory,
        childCategory,
      });
    });
  };

  const visibleSections = sections.filter((section) => getCategoryRouteId(section.subCategory));
  const showBlockingError = Boolean(error) && navigableCategories.length === 0 && !isLoading;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close categories" style={StyleSheet.absoluteFill} onPress={onClose} />
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

              {navigableCategories.map((category, index) => {
                const categoryId = getCategoryRouteId(category);
                if (!categoryId) {
                  return null;
                }

                const categoryName = getCategoryDisplayName(category);
                const isExpanded = expandedParentId === categoryId;
                const isLastParent =
                  index === navigableCategories.length - 1 && (!isExpanded || visibleSections.length === 0);

                return (
                  <View key={categoryId}>
                    <CategoryTreeRow
                      label={categoryName}
                      expanded={isExpanded}
                      onPress={() => handleParentBrowse(category)}
                      onChevronPress={() => handleParentExpand(categoryId)}
                      isLast={isLastParent}
                    />

                    {isExpanded ? (
                      <View style={styles.subTree}>
                        {sectionsError && visibleSections.length > 0 ? (
                          <Pressable style={styles.refreshBanner} onPress={() => void retrySections()}>
                            <AppText variant="bodySmall" color="error">
                              {sectionsError}
                            </AppText>
                            <AppText variant="bodySmall" style={styles.refreshBannerAction}>
                              Retry
                            </AppText>
                          </Pressable>
                        ) : null}

                        {visibleSections.map((section, sectionIndex) => {
                          const subCategoryId = getCategoryRouteId(section.subCategory);
                          if (!subCategoryId) {
                            return null;
                          }

                          const subCategoryName = getCategoryDisplayName(section.subCategory);
                          const hasChildren = section.childCategories.length > 0;
                          const subKey = `${categoryId}:${subCategoryId}`;
                          const isSubExpanded = expandedSubKey === subKey;
                          const isLastSection =
                            sectionIndex === visibleSections.length - 1 &&
                            (!hasChildren || !isSubExpanded);

                          return (
                            <View key={subKey}>
                              <CategoryTreeRow
                                label={subCategoryName}
                                depth={1}
                                expanded={hasChildren ? isSubExpanded : false}
                                showChevron={hasChildren}
                                onPress={() =>
                                  handleSubBrowse(categoryId, categoryName, section.subCategory)
                                }
                                onChevronPress={() =>
                                  setExpandedSubKey((current) => (current === subKey ? null : subKey))
                                }
                                isLast={isLastSection}
                              />

                              {hasChildren && isSubExpanded
                                ? section.childCategories.map((childCategory, childIndex) => {
                                    const childId = getCategoryRouteId(childCategory);
                                    if (!childId) {
                                      return null;
                                    }

                                    const isLastChild =
                                      sectionIndex === visibleSections.length - 1 &&
                                      childIndex === section.childCategories.length - 1;

                                    return (
                                      <CategoryTreeRow
                                        key={childId}
                                        label={getCategoryDisplayName(childCategory)}
                                        depth={2}
                                        showChevron={false}
                                        onPress={() =>
                                          handleChildBrowse(
                                            categoryId,
                                            categoryName,
                                            section.subCategory,
                                            childCategory,
                                          )
                                        }
                                        isLast={isLastChild}
                                      />
                                    );
                                  })
                                : null}
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
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
  subTree: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.border,
  },
});
