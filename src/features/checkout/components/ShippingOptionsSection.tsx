import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatProductPrice } from '../../products/utils/productDisplay';
import type { SellerShippingOptionsGroup } from '../hooks/useCheckoutShippingRates';

interface ShippingOptionsSectionProps {
  groups: SellerShippingOptionsGroup[];
  selectedOptionBySeller: Record<string, string>;
  onSelectOption: (sellerId: string, optionId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  canFetchRates: boolean;
  hasMultipleSellers: boolean;
}

export function ShippingOptionsSection({
  groups,
  selectedOptionBySeller,
  onSelectOption,
  isLoading,
  error,
  onRetry,
  canFetchRates,
  hasMultipleSellers,
}: ShippingOptionsSectionProps) {
  if (!canFetchRates) {
    return (
      <Text style={styles.helperText}>
        Complete the shipping address to calculate shipping rates.
      </Text>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator size="small" color="#EA580C" />
        <Text style={styles.helperText}>Calculating shipping rates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (groups.length === 0) {
    return <Text style={styles.helperText}>No shipping options available.</Text>;
  }

  return (
    <View style={styles.optionsList}>
      {groups.map((group) => (
        <View key={group.sellerId} style={styles.groupWrap}>
          {hasMultipleSellers ? (
            <Text style={styles.groupTitle}>{group.sellerName}</Text>
          ) : null}
          {group.options.map((option) => {
            const isSelected = selectedOptionBySeller[group.sellerId] === option.id;

            return (
              <Pressable
                key={option.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => onSelectOption(group.sellerId, option.id)}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </View>
                <Text style={styles.optionPrice}>{formatProductPrice(option.rate)}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  optionsList: {
    gap: 14,
  },
  groupWrap: {
    gap: 10,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFF7ED',
    gap: 8,
  },
  optionCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFEDD5',
  },
  optionHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: '#EA580C',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#172554',
    lineHeight: 20,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
    marginLeft: 28,
  },
  helperText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  stateBox: {
    gap: 10,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
