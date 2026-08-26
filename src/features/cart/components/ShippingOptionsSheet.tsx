import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../../checkout/hooks/useCheckoutShippingRates';

export interface ShippingOptionsSheetProps {
  visible: boolean;
  groups: SellerShippingOptionsGroup[];
  selectedOptionBySeller: Record<string, string>;
  hasMultipleSellers: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
  onConfirm: (selections: Record<string, string>) => void;
}

const SHEET_HEIGHT_RATIO = 0.82;
const SHEET_CHROME_HEIGHT = 132;

function ShippingOptionRow({
  option,
  selected,
  onSelect,
}: {
  option: CheckoutShippingOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={({ pressed }) => [
        styles.optionRow,
        selected && styles.optionRowSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>

      <View style={styles.optionContent}>
        <AppText variant="bodyMedium" style={styles.optionLabel}>
          {option.label}
        </AppText>
      </View>
    </Pressable>
  );
}

export function ShippingOptionsSheet({
  visible,
  groups,
  selectedOptionBySeller,
  hasMultipleSellers,
  isLoading,
  error,
  onClose,
  onRetry,
  onConfirm,
}: ShippingOptionsSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const scrollMaxHeight = Math.max(
    220,
    sheetMaxHeight - SHEET_CHROME_HEIGHT - insets.bottom - spacing.md,
  );
  const [draftSelections, setDraftSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setDraftSelections(selectedOptionBySeller);
    }
  }, [selectedOptionBySeller, visible]);

  const canConfirm = useMemo(
    () => groups.every((group) => Boolean(draftSelections[group.sellerId])),
    [draftSelections, groups],
  );

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }

    onConfirm(draftSelections);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <AppText variant="h3" style={styles.title}>
              Choose shipping
            </AppText>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <AppText variant="bodyMedium" color="textLink">
                Close
              </AppText>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="bodySmall" color="textSecondary">
                Loading shipping options...
              </AppText>
            </View>
          ) : error ? (
            <View style={styles.messageBox}>
              <AppText variant="body" color="error">
                {error}
              </AppText>
              <AppButton label="Try again" variant="outline" onPress={onRetry} />
            </View>
          ) : (
            <>
              {hasMultipleSellers ? (
                <AppText variant="bodySmall" color="textSecondary" style={styles.helperText}>
                  All items ship to one address. Choose a carrier for each seller below.
                </AppText>
              ) : null}

              <ScrollView
                style={[styles.scrollArea, { maxHeight: scrollMaxHeight }]}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                bounces
              >
                {groups.map((group) => (
                  <View key={group.sellerId} style={styles.groupWrap}>
                    {hasMultipleSellers ? (
                      <AppText variant="label" color="textSecondary" style={styles.groupTitle}>
                        {group.sellerName}
                      </AppText>
                    ) : null}

                    {group.options.map((option) => (
                      <ShippingOptionRow
                        key={option.id}
                        option={option}
                        selected={draftSelections[group.sellerId] === option.id}
                        onSelect={() =>
                          setDraftSelections((current) => ({
                            ...current,
                            [group.sellerId]: option.id,
                          }))
                        }
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>

              <AppButton
                label="Use this shipping"
                fullWidth
                size="lg"
                shape="pill"
                disabled={!canConfirm}
                onPress={handleConfirm}
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerSpacer: {
    width: 48,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  messageBox: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  helperText: {
    lineHeight: 20,
  },
  scrollArea: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  groupWrap: {
    gap: spacing.sm,
  },
  groupTitle: {
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSecondary,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
