import type {
  CheckoutShippingOption,
  SellerShippingOptionsGroup,
} from '../../checkout/hooks/useCheckoutShippingRates';
import { formatProductPrice } from '../../products/utils/productDisplay';

export function getSelectedShippingOptions(
  groups: SellerShippingOptionsGroup[],
  selectedOptionBySeller: Record<string, string>,
): CheckoutShippingOption[] {
  return groups
    .map((group) => {
      const selectedId = selectedOptionBySeller[group.sellerId];
      return group.options.find((option) => option.id === selectedId) ?? group.options[0];
    })
    .filter(Boolean) as CheckoutShippingOption[];
}

export function formatShippingOptionSummary(option: CheckoutShippingOption): string {
  return option.label;
}

/** One buyer-facing shipping summary — web shows a single order shipping total. */
export function formatConsolidatedShippingSummary(
  selectedOptions: CheckoutShippingOption[],
  totalCost: number,
): string {
  if (selectedOptions.length === 0) {
    return '';
  }

  const totalLabel = formatProductPrice(totalCost);

  if (selectedOptions.length === 1) {
    return selectedOptions[0].label;
  }

  return `Shipping to one address · ${totalLabel}`;
}
