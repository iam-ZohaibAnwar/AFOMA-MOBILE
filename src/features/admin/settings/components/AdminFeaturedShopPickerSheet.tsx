import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminSellerListItem } from '../../seller-management/types/adminSellerManagement';
import { getAdminSellerDisplayName } from '../../seller-management/utils/adminSellerDisplay';
import { ADMIN_FEATURED_SHOPS_MAX } from '../utils/adminSettingsConstants';

const SHEET_HEIGHT_RATIO = 0.78;

export interface AdminFeaturedShopPickerSheetProps {
  visible: boolean;
  sellers: AdminSellerListItem[];
  selectedSellerIds: ReadonlySet<string>;
  searchValue: string;
  isLoading: boolean;
  error: string | null;
  selectionError: string | null;
  canSelectMore: boolean;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onToggleSeller: (seller: AdminSellerListItem) => void;
  onRetry: () => void;
}

function SellerPickerRow({
  seller,
  selected,
  disabled,
  onToggle,
}: {
  seller: AdminSellerListItem;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && !disabled && styles.pressed]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <AppText variant="caption" style={styles.checkmark}>✓</AppText> : null}
      </View>
      <View style={styles.rowCopy}>
        <AppText variant="bodyMedium" style={styles.rowTitle}>
          {getAdminSellerDisplayName(seller)}
        </AppText>
        {seller.email ? (
          <AppText variant="caption" color="textSecondary" numberOfLines={1}>
            {seller.email}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

export function AdminFeaturedShopPickerSheet({
  visible,
  sellers,
  selectedSellerIds,
  searchValue,
  isLoading,
  error,
  selectionError,
  canSelectMore,
  onSearchChange,
  onClose,
  onToggleSeller,
  onRetry,
}: AdminFeaturedShopPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: sheetHeight, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          <AppText variant="h3" style={styles.title}>
            Select sellers
          </AppText>
          <AppText variant="caption" color="textSecondary">
            Up to {ADMIN_FEATURED_SHOPS_MAX} approved active shops. Order is set on the main screen.
          </AppText>

          <SearchBar
            mode="input"
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder="Search sellers"
          />

          {selectionError ? (
            <AppText variant="caption" style={styles.selectionError}>
              {selectionError}
            </AppText>
          ) : null}

          {error ? (
            <ErrorState message={error} onAction={onRetry} style={styles.inlineError} />
          ) : isLoading && sellers.length === 0 ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={sellers}
              keyExtractor={(item) => item._id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <AppText variant="bodyMedium" color="textSecondary" style={styles.emptyList}>
                  No matching sellers found.
                </AppText>
              }
              renderItem={({ item }) => {
                const selected = selectedSellerIds.has(item._id);
                const disabled = !selected && !canSelectMore;

                return (
                  <SellerPickerRow
                    seller={item}
                    selected={selected}
                    disabled={disabled}
                    onToggle={() => onToggleSeller(item)}
                  />
                );
              }}
            />
          )}

          <AppButton label="Done" onPress={onClose} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.textPrimary,
  },
  selectionError: {
    color: colors.error,
  },
  inlineError: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
  loader: {
    marginVertical: spacing.lg,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  emptyList: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
