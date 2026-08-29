import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Product } from '../../../services/types/product';
import {
  areAllAttributesSelected,
  buildCustomizableCartKey,
  buildDefaultSelectedAttributes,
  buildSelectedVariationsForCart,
  findMatchingVariation,
  getUniqueAttributeValues,
  getVariationAttributeNames,
  getVariationInventory,
  getVariationMaxQuantity,
  getProductMaxQuantity,
  isInventoryOutOfStock,
  isVariationOptionAvailable,
  normalizeVariationAttributeValue,
  resolveProductImageUrl,
  type SelectedAttributes,
} from '../utils/productVariations';
import {
  getProductRouteId,
  isProductDisabled,
  isProductOutOfStock,
} from '../utils/productDisplay';

const DOWNLOADABLE_QUANTITY = 1;

function getInitialSelectedAttributes(product: Product | null): SelectedAttributes {
  if (product?.productType === 'Customizable' && product.variations?.length) {
    return buildDefaultSelectedAttributes(product.variations);
  }

  return {};
}

export function useProductDetailVariations(product: Product | null) {
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttributes>(() =>
    getInitialSelectedAttributes(product),
  );
  const [quantity, setQuantity] = useState(1);

  const productType = product?.productType ?? 'Standard';
  const isCustomizable = productType === 'Customizable';
  const isDownloadable = productType === 'Downloadable';
  const isStandard = productType === 'Standard';

  const productIdentityKey = product
    ? `${product._id ?? ''}:${product.slug ?? ''}:${product.productType ?? ''}`
    : '';

  const selectedAttributesKey = useMemo(
    () => JSON.stringify(selectedAttributes),
    [selectedAttributes],
  );

  useEffect(() => {
    if (!product) {
      setSelectedAttributes({});
      setQuantity(1);
      return;
    }

    if (isCustomizable && product.variations?.length) {
      setSelectedAttributes(buildDefaultSelectedAttributes(product.variations));
    } else {
      setSelectedAttributes({});
    }
    setQuantity(1);
  }, [isCustomizable, productIdentityKey]);

  useEffect(() => {
    if (isCustomizable) {
      setQuantity(1);
    }
  }, [isCustomizable, selectedAttributesKey]);

  const attributeNames = useMemo(
    () => getVariationAttributeNames(product?.variations),
    [product?.variations],
  );

  const attributeOptions = useMemo(() => {
    if (!product?.variations?.length) {
      return {} as Record<string, string[]>;
    }

    return attributeNames.reduce<Record<string, string[]>>((acc, attributeName) => {
      acc[attributeName] = getUniqueAttributeValues(product.variations!, attributeName);
      return acc;
    }, {});
  }, [attributeNames, product?.variations]);

  const allAttributesSelected = useMemo(
    () => areAllAttributesSelected(product?.variations, selectedAttributes),
    [product?.variations, selectedAttributes],
  );

  const matchingVariation = useMemo(
    () =>
      allAttributesSelected
        ? findMatchingVariation(product?.variations, selectedAttributes)
        : undefined,
    [allAttributesSelected, product?.variations, selectedAttributes],
  );

  const maxQuantity = useMemo(() => {
    if (isDownloadable) {
      return DOWNLOADABLE_QUANTITY;
    }

    if (isCustomizable) {
      return getVariationMaxQuantity(matchingVariation);
    }

    return getProductMaxQuantity(product);
  }, [isCustomizable, isDownloadable, matchingVariation, product?.quantity]);

  useEffect(() => {
    setQuantity((current) => {
      if (current > maxQuantity) {
        return Math.max(1, maxQuantity);
      }

      return current;
    });
  }, [maxQuantity]);

  const outOfStock = useMemo(() => {
    if (!product) {
      return true;
    }

    if (isCustomizable) {
      if (!allAttributesSelected) {
        return true;
      }

      return isInventoryOutOfStock(getVariationInventory(product.variations, selectedAttributes));
    }

    return isProductOutOfStock(product);
  }, [allAttributesSelected, isCustomizable, product, selectedAttributes]);

  const disabledBySeller = product ? isProductDisabled(product) : false;

  const canAddToCart = useMemo(() => {
    if (!product || disabledBySeller || outOfStock || maxQuantity < 1) {
      return false;
    }

    if (isCustomizable && !allAttributesSelected) {
      return false;
    }

    return true;
  }, [allAttributesSelected, disabledBySeller, isCustomizable, maxQuantity, outOfStock, product]);

  const selectionIncomplete = isCustomizable && !allAttributesSelected;

  const displayImageUrl = useMemo(
    () => (product ? resolveProductImageUrl(product, matchingVariation) : undefined),
    [matchingVariation, product],
  );

  const selectedVariations = useMemo(
    () => buildSelectedVariationsForCart(product?.variations, selectedAttributes),
    [product?.variations, selectedAttributes],
  );

  const cartKey = useMemo(() => {
    const productRouteId = product ? getProductRouteId(product) : undefined;
    if (!productRouteId) {
      return undefined;
    }

    if (isCustomizable && allAttributesSelected && selectedVariations.length > 0) {
      return buildCustomizableCartKey(productRouteId, selectedVariations);
    }

    return productRouteId;
  }, [allAttributesSelected, isCustomizable, product, selectedVariations]);

  const selectAttribute = useCallback((attributeName: string, value: string) => {
    setSelectedAttributes((current) => ({
      ...current,
      [attributeName]: normalizeVariationAttributeValue(value),
    }));
  }, []);

  const isOptionAvailable = useCallback(
    (attributeName: string, optionValue: string) =>
      isVariationOptionAvailable(
        product?.variations,
        attributeName,
        optionValue,
        selectedAttributes,
      ),
    [product?.variations, selectedAttributes],
  );

  const incrementQuantity = useCallback(() => {
    setQuantity((current) => (current < maxQuantity ? current + 1 : current));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity((current) => (current > 1 ? current - 1 : current));
  }, []);

  const showQuantityStepper = isStandard || isCustomizable;

  return {
    productType,
    isStandard,
    isCustomizable,
    isDownloadable,
    selectedAttributes,
    attributeNames,
    attributeOptions,
    selectAttribute,
    isOptionAvailable,
    quantity,
    maxQuantity,
    incrementQuantity,
    decrementQuantity,
    showQuantityStepper,
    matchingVariation,
    displayImageUrl,
    selectedVariations,
    cartKey,
    outOfStock,
    disabledBySeller,
    canAddToCart,
    selectionIncomplete,
    allAttributesSelected,
  };
}
