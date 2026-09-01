import {
  ExpandableMultilineInput,
  type ExpandableMultilineInputProps,
} from './ExpandableMultilineInput';

export const META_TITLE_MAX_LENGTH = 120;
export const META_KEYWORDS_MAX_LENGTH = 250;
export const META_DESCRIPTION_MAX_LENGTH = 250;

export type MetaSeoInputProps = Omit<
  ExpandableMultilineInputProps,
  'sheetTitle' | 'sheetPlaceholder' | 'expandAccessibilityLabel' | 'expandHint' | 'maxLength'
> &
  Partial<Pick<ExpandableMultilineInputProps, 'maxLength'>>;

export function MetaTitleInput({
  label = 'Meta title',
  placeholder = 'Optional SEO title',
  maxLength = META_TITLE_MAX_LENGTH,
  ...props
}: MetaSeoInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      sheetTitle="Meta title"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full meta title"
      expandHint="Tap to view and edit the full meta title"
    />
  );
}

export function MetaKeywordsInput({
  label = 'Meta keywords',
  placeholder = 'Optional keywords',
  maxLength = META_KEYWORDS_MAX_LENGTH,
  compactLines = 3,
  ...props
}: MetaSeoInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      compactLines={compactLines}
      sheetTitle="Meta keywords"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full meta keywords"
      expandHint="Tap to view and edit the full meta keywords"
    />
  );
}

export function MetaDescriptionInput({
  label = 'Meta description',
  placeholder = 'Optional SEO description',
  maxLength = META_DESCRIPTION_MAX_LENGTH,
  compactLines = 4,
  ...props
}: MetaSeoInputProps) {
  return (
    <ExpandableMultilineInput
      {...props}
      label={label}
      placeholder={placeholder}
      maxLength={maxLength}
      compactLines={compactLines}
      sheetTitle="Meta description"
      sheetPlaceholder={placeholder}
      expandAccessibilityLabel="View full meta description"
      expandHint="Tap to view and edit the full meta description"
    />
  );
}
