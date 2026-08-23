import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import { ADMIN_CSV_SCHEMA_OPTIONS, type AdminCsvSchema } from '../types/adminCsvExport';

const SHEET_HEIGHT_RATIO = 0.62;

export interface AdminCsvSchemaPickerSheetProps {
  visible: boolean;
  selectedSchema: AdminCsvSchema | null;
  onClose: () => void;
  onSelect: (schema: AdminCsvSchema) => void;
}

function SchemaOptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={({ pressed }) => [styles.optionRow, selected && styles.optionRowSelected, pressed && styles.pressed]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <AppText variant="bodyMedium">{label}</AppText>
    </Pressable>
  );
}

export function AdminCsvSchemaPickerSheet({
  visible,
  selectedSchema,
  onClose,
  onSelect,
}: AdminCsvSchemaPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [draftSchema, setDraftSchema] = useState<AdminCsvSchema | null>(selectedSchema);

  useEffect(() => {
    if (visible) {
      setDraftSchema(selectedSchema);
    }
  }, [selectedSchema, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />

      <View
        style={[
          styles.sheet,
          {
            maxHeight: sheetMaxHeight,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
      >
        <View style={styles.handle} />
        <AppText variant="h3" style={styles.title}>
          Select schema
        </AppText>

        <ScrollView contentContainerStyle={styles.options}>
          {ADMIN_CSV_SCHEMA_OPTIONS.map((option) => (
            <SchemaOptionRow
              key={option.value}
              label={option.label}
              selected={draftSchema === option.value}
              onSelect={() => setDraftSchema(option.value)}
            />
          ))}
        </ScrollView>

        <AppButton
          label="Apply"
          disabled={!draftSchema}
          onPress={() => {
            if (draftSchema) {
              onSelect(draftSchema);
            }
            onClose();
          }}
          fullWidth
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  options: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.9,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
