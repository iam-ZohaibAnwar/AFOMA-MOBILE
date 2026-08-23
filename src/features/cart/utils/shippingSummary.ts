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
  return `${option.label} · ${formatProductPrice(option.rate)}`;
}
