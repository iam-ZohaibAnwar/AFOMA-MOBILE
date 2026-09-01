import {
  ExpandableMultilineInput,
  ExpandableMultilineText,
  type ExpandableMultilineInputProps,
  type ExpandableMultilineTextProps,
} from './ExpandableMultilineInput';

export const PRODUCT_NAME_MAX_LENGTH = 120;

export type ProductNameInputProps = Omit<
  ExpandableMultilineInputProps,
  'sheetTitle' | 'sheetPlaceholder' | 'expandAccessibilityLabel' | 'expandHint' | 'maxLength'
> &
  Partial<Pick<ExpandableMultilineInputProps, 'maxLength'>>;

export type ExpandableProductNameTextProps = Omit<
  ExpandableMultilineTextProps,
  'sheetTitle' | 'expandLabel' | 'maxLength'
> &
  Partial<Pick<ExpandableMultilineTextProps, 'maxLength'>>;

export function ProductNameInput({
  label = 'Product name *',
  placeholder = 'Enter product name',
  maxLength = PRODUCT_NAME_MAX_LENGTH,
  ...props
}: ProductNameInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      sheetTitle="Product name"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full product name"
    />
  );
}

export function ExpandableProductNameText({
  maxLength = PRODUCT_NAME_MAX_LENGTH,
  ...props
}: ExpandableProductNameTextProps) {
  return (
    <ExpandableMultilineText
      {...props}
      maxLength={maxLength}
      sheetTitle="Product name"
    />
  );
}
