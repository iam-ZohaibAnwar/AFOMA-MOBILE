import {
  ExpandableMultilineInput,
  type ExpandableMultilineInputProps,
} from './ExpandableMultilineInput';

export const ALT_TEXT_MAX_LENGTH = 120;

export type AltTextInputProps = Omit<
  ExpandableMultilineInputProps,
  'sheetTitle' | 'sheetPlaceholder' | 'expandAccessibilityLabel' | 'expandHint' | 'maxLength'
> &
  Partial<Pick<ExpandableMultilineInputProps, 'maxLength'>>;

export function AltTextInput({
  label = 'Alt text',
  placeholder = 'Describe this image',
  maxLength = ALT_TEXT_MAX_LENGTH,
  ...props
}: AltTextInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      sheetTitle="Alt text"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full alt text"
      expandHint="Tap to view and edit the full alt text"
    />
  );
}
