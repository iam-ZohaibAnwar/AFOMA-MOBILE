import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from '../../../../components/ecommerce/SearchBar';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { getCountrySelectOptions } from '../../../../utils/regionOptions';

const SHEET_HEIGHT_RATIO = 0.82;

export interface AdminShippingCountryPickerSheetProps {
  visible: boolean;
  selectedCountries: string[];
  onClose: () => void;
  onChange: (countries: string[]) => void;
}

function CountryPickerRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && styles.pressed]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? (
          <AppText variant="caption" style={styles.checkmark}>
            ✓
          </AppText>
        ) : null}
      </View>
      <AppText variant="bodyMedium" style={styles.rowTitle}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function AdminShippingCountryPickerSheet({
  visible,
  selectedCountries,
  onClose,
  onChange,
}: AdminShippingCountryPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [searchValue, setSearchValue] = useState('');
  const countryOptions = useMemo(() => getCountrySelectOptions(), []);
  const selectedSet = useMemo(() => new Set(selectedCountries), [selectedCountries]);

  const filteredCountries = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) {
      return countryOptions;
    }

    return countryOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [countryOptions, searchValue]);

  const toggleCountry = (countryName: string) => {
    if (selectedSet.has(countryName)) {
      onChange(selectedCountries.filter((name) => name !== countryName));
      return;
    }

    onChange([...selectedCountries, countryName]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight: sheetHeight, paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />

          <AppText variant="h3" style={styles.title}>
            Select countries
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {selectedCountries.length} selected — country names are stored as on web.
          </AppText>

          <SearchBar
            mode="input"
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search countries"
          />

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <AppText variant="bodyMedium" color="textSecondary" style={styles.emptyList}>
                No matching countries found.
              </AppText>
            }
            renderItem={({ item }) => (
              <CountryPickerRow
                label={item.label}
                selected={selectedSet.has(item.value)}
                onToggle={() => toggleCountry(item.value)}
              />
            )}
          />

          <AppButton label="Done" onPress={onClose} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.textPrimary,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  emptyList: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  rowTitle: {
    flex: 1,
    color: colors.textPrimary,
  },
});
