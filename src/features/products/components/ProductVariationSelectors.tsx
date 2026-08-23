import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import { layout, radius, spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
import { isColorAttributeName, resolveColorSwatch } from '../utils/colorSwatches';
import { normalizeVariationAttributeValue } from '../utils/productVariations';

export interface ProductVariationSelectorsProps {
  attributeNames: string[];
  attributeOptions: Record<string, string[]>;
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (attributeName: string, value: string) => void;
  isOptionAvailable?: (attributeName: string, value: string) => boolean;
  theme: PdpTheme;
}

export function ProductVariationSelectors({
  attributeNames,
  attributeOptions,
  selectedAttributes,
  onSelectAttribute,
  isOptionAvailable,
  theme,
}: ProductVariationSelectorsProps) {
  if (attributeNames.length === 0) {
    return null;
  }

  const handleSizeGuidePress = () => {
    Alert.alert('Coming soon', 'Size guide will be available in a future update.');
  };

  return (
    <View style={styles.container}>
      {attributeNames.map((attributeName) => {
        const options = attributeOptions[attributeName] ?? [];
        const selectedValue = normalizeVariationAttributeValue(selectedAttributes[attributeName]);
        const isColorAttribute = isColorAttributeName(attributeName);
        const isSizeAttribute = attributeName.trim().toLowerCase().includes('size');

        return (
          <View key={attributeName} style={styles.group}>
            <View style={styles.groupHeader}>
              <AppText variant="label" style={{ color: theme.textPrimary }}>
                {attributeName}
              </AppText>
              {isSizeAttribute ? (
                <Pressable accessibilityRole="button" onPress={handleSizeGuidePress}>
                  <AppText variant="bodySmall" color="textLink">
                    Size guide
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.optionRow}>
              {options.map((option) => {
                const normalizedOption = normalizeVariationAttributeValue(option);
                const isSelected = selectedValue === normalizedOption;
                const isAvailable = isOptionAvailable?.(attributeName, option) ?? true;

                if (isColorAttribute) {
                  return (
                    <Pressable
                      key={`${attributeName}-${option}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                      accessibilityLabel={`Select ${attributeName} ${option}`}
                      disabled={!isAvailable}
                      onPress={() => onSelectAttribute(attributeName, option)}
                      style={({ pressed }) => [pressed && styles.pressed]}
                    >
                      <View
                        style={[
                          styles.swatchOuter,
                          {
                            borderColor: isSelected ? theme.swatchSelectedRing : theme.swatchBorder,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.swatch,
                            {
                              backgroundColor: resolveColorSwatch(option),
                              opacity: isAvailable ? 1 : 0.35,
                            },
                          ]}
                        >
                          {isSelected ? (
                            <AppText variant="caption" style={styles.swatchCheck}>
                              ✓
                            </AppText>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                }

                return (
                  <Pressable
                    key={`${attributeName}-${option}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
                    accessibilityLabel={`Select ${attributeName} ${option}`}
                    disabled={!isAvailable}
                    onPress={() => onSelectAttribute(attributeName, option)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      {
                        borderColor: isSelected ? theme.pillSelectedBg : theme.pillBorder,
                        backgroundColor: isSelected ? theme.pillSelectedBg : theme.surface,
                      },
                      !isAvailable && styles.optionChipUnavailable,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText
                      variant="label"
                      style={{
                        color: isSelected
                          ? theme.pillSelectedText
                          : isAvailable
                            ? theme.pillText
                            : theme.pillDisabledText,
                        textDecorationLine: isAvailable ? 'none' : 'line-through',
                      }}
                      numberOfLines={1}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    minWidth: 44,
    minHeight: layout.minTouchTarget - 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionChipUnavailable: {
    backgroundColor: 'transparent',
  },
  swatchOuter: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCheck: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.92,
  },
});
