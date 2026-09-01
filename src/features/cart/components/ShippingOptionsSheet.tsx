import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '../../../components/ui/BottomSheet';
import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';
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

  const header = (
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
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={header}
      chromeHeight={132}
      scrollable={!isLoading && !error}
      footer={
        !isLoading && !error ? (
          <AppButton
            label="Use this shipping"
            fullWidth
            size="lg"
            shape="pill"
            disabled={!canConfirm}
            onPress={handleConfirm}
          />
        ) : null
      }
    >
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
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '700',
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
  groupWrap: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  groupTitle: {
    textTransform: 'uppercase',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
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
