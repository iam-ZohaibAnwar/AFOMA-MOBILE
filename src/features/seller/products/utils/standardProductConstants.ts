export const STANDARD_PRODUCT_MIN_IMAGES = 3;

export const MAX_PRODUCT_LISTING_IMAGE_BYTES = 2 * 1024 * 1024;

export const LISTING_IMAGE_MAX_EDGE = 1200;

export const SELLER_INVENTORY_OPTIONS = [
  { label: 'In Stock', value: 'InStock' },
  { label: 'Out of Stock', value: 'OutOffStock' },
] as const;

export type SellerInventoryValue = (typeof SELLER_INVENTORY_OPTIONS)[number]['value'];

export const STANDARD_WIZARD_STEPS = [
  { id: 'basic', title: 'Basic information' },
  { id: 'categories', title: 'Categories' },
  { id: 'images', title: 'Images' },
  { id: 'pricing', title: 'Pricing & inventory' },
  { id: 'shipping', title: 'Shipping' },
  { id: 'additional', title: 'Additional information' },
  { id: 'review', title: 'Review' },
] as const;

export type StandardWizardStepId = (typeof STANDARD_WIZARD_STEPS)[number]['id'];
