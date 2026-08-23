export const DOWNLOADABLE_PRODUCT_MIN_IMAGES = 2;

export const DOWNLOADABLE_WIZARD_STEPS = [
  { id: 'basic', title: 'Basic information' },
  { id: 'categories', title: 'Categories' },
  { id: 'images', title: 'Images' },
  { id: 'pricing', title: 'Pricing & inventory' },
  { id: 'download', title: 'Download file' },
  { id: 'additional', title: 'Additional information' },
  { id: 'review', title: 'Review' },
] as const;

export type DownloadableWizardStepId = (typeof DOWNLOADABLE_WIZARD_STEPS)[number]['id'];

export const CUSTOMIZABLE_PRODUCT_MIN_IMAGES = 3;

export const CUSTOMIZABLE_WIZARD_STEPS = [
  { id: 'basic', title: 'Basic information' },
  { id: 'categories', title: 'Categories' },
  { id: 'images', title: 'Images' },
  { id: 'shipping', title: 'Shipping' },
  { id: 'additional', title: 'Additional information' },
  { id: 'review', title: 'Review' },
] as const;

export type CustomizableWizardStepId = (typeof CUSTOMIZABLE_WIZARD_STEPS)[number]['id'];

export const VARIATION_INVENTORY_OPTIONS = [
  { label: 'In Stock', value: 'In Stock' },
  { label: 'Out of Stock', value: 'Out of Stock' },
] as const;

export type VariationInventoryValue = (typeof VARIATION_INVENTORY_OPTIONS)[number]['value'];

export const MAX_DOWNLOADABLE_FILE_BYTES = 50 * 1024 * 1024;
