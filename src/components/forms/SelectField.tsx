import { useMemo, useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

import type { SelectOption } from '../../utils/regionOptions';
import { SelectDropdownTrigger } from './SelectDropdownTrigger';
import { SelectOptionsSheet } from './SelectOptionsSheet';

export interface SelectFieldProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  tone?: 'default' | 'surface';
  containerStyle?: StyleProp<ViewStyle>;
  modalTitle?: string;
  isOptionDisabled?: (option: SelectOption) => boolean;
  /** `primary` = teal links/CTA tint; `navy` = web PDP attribute picker (`text-blue-950`). */
  selectionAccent?: 'primary' | 'navy';
  /** Render trigger only; parent opens a sibling picker sheet (for nested modals). */
  hostedPicker?: boolean;
  onOpenPicker?: () => void;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  disabled = false,
  tone = 'default',
  containerStyle,
  modalTitle,
  isOptionDisabled,
  selectionAccent = 'primary',
  hostedPicker = false,
  onOpenPicker,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? '',
    [options, value],
  );

  const displayValue = selectedLabel || value;

  const handleOpen = () => {
    if (hostedPicker) {
      onOpenPicker?.();
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <SelectDropdownTrigger
        label={label}
        value={displayValue}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        tone={tone}
        containerStyle={containerStyle}
        onPress={handleOpen}
      />

      {!hostedPicker ? (
        <SelectOptionsSheet
          visible={open}
          title={modalTitle ?? label ?? 'Select'}
          options={options}
          value={value}
          onSelect={onChange}
          onClose={() => setOpen(false)}
          selectionAccent={selectionAccent}
          isOptionDisabled={isOptionDisabled}
        />
      ) : null}
    </>
  );
}
