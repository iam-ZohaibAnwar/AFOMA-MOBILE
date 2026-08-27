import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { SelectField } from '../../../components/forms/SelectField';
import { AppText } from '../../../components/ui/AppText';
import { spacing } from '../../../design-system';
import type { PdpTheme } from '../../../design-system/pdpTheme';
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
        const isSizeAttribute = attributeName.trim().toLowerCase().includes('size');

        return (
          <View key={attributeName} style={styles.group}>
            <View style={styles.groupHeader}>
              <AppText variant="label" style={{ color: theme.textPrimary }}>
                {attributeName}
              </AppText>
              {isSizeAttribute ? (
                <Pressable accessibilityRole="button" onPress={handleSizeGuidePress}>
                  <AppText variant="bodySmall" style={{ color: theme.textPrimary }}>
                    Size guide
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            <SelectField
              value={selectedValue}
              options={options.map((option) => ({
                label: option,
                value: normalizeVariationAttributeValue(option),
              }))}
              onChange={(value) => onSelectAttribute(attributeName, value)}
              placeholder={`Select ${attributeName}`}
              modalTitle={attributeName}
              tone="surface"
              selectionAccent="navy"
              isOptionDisabled={(option) =>
                !(isOptionAvailable?.(attributeName, option.value) ?? true)
              }
            />
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
});
