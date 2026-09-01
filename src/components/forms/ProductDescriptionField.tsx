import { StyleSheet } from 'react-native';

import {
  ExpandableMultilineInput,
  ExpandableMultilineText,
  type ExpandableMultilineInputProps,
  type ExpandableMultilineTextProps,
} from './ExpandableMultilineInput';

export const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;

export type ProductDescriptionInputProps = Omit<
  ExpandableMultilineInputProps,
  'sheetTitle' | 'sheetPlaceholder' | 'expandAccessibilityLabel' | 'expandHint' | 'maxLength' | 'compactLines'
> &
  Partial<Pick<ExpandableMultilineInputProps, 'maxLength' | 'compactLines'>>;

export type ExpandableProductDescriptionTextProps = Omit<
  ExpandableMultilineTextProps,
  'sheetTitle' | 'expandLabel' | 'maxLength' | 'layout'
> &
  Partial<Pick<ExpandableMultilineTextProps, 'maxLength'>>;

export function ProductDescriptionInput({
  label = 'Description *',
  placeholder = 'Describe your product',
  maxLength = PRODUCT_DESCRIPTION_MAX_LENGTH,
  compactLines = 5,
  ...props
}: ProductDescriptionInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      compactLines={compactLines}
      sheetTitle="Description"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full description"
      alwaysShowExpandButton
      style={styles.textArea}
    />
  );
}

export function ExpandableProductDescriptionText({
  maxLength = PRODUCT_DESCRIPTION_MAX_LENGTH,
  ...props
}: ExpandableProductDescriptionTextProps) {
  return (
    <ExpandableMultilineText
      {...props}
      layout="stacked"
      maxLength={maxLength}
      sheetTitle="Description"
    />
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 120,
  },
});
