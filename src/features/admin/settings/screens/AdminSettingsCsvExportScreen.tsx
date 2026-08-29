import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminCsvSchemaPickerSheet } from '../components/AdminCsvSchemaPickerSheet';
import { AdminSettingsDetailHero } from '../components/AdminSettingsDetailHero';
import { useAdminCsvExport } from '../hooks/useAdminCsvExport';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsCsvExport'>;

const RETURN_TO = authReturnTo.adminSettingsCsvExport();

export function AdminSettingsCsvExportScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const [schemaPickerVisible, setSchemaPickerVisible] = useState(false);

  const {
    schema,
    selectedLabel,
    fromDate,
    toDate,
    fieldError,
    error,
    isDownloading,
    canDownload,
    setSchema,
    setFromDate,
    setToDate,
    download,
    clearError,
  } = useAdminCsvExport();

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <AdminSettingsDetailHero
          title="CSV Export"
          icon="document-text-outline"
          statusLabel={selectedLabel ? `Schema: ${selectedLabel}` : 'No schema selected'}
          statusIcon="document-outline"
        />

        <AdminProductDetailCardShell title="Export options" icon="options-outline" accent>
          <AppButton
            label={selectedLabel ?? 'Select schema'}
            variant="outline"
            onPress={() => setSchemaPickerVisible(true)}
            fullWidth
          />

          <AppInput
            label="From date (optional)"
            tone="surface"
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppInput
            label="To date (optional)"
            tone="surface"
            value={toDate}
            onChangeText={setToDate}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {fieldError ? (
            <AppText variant="caption" style={styles.fieldError}>
              {fieldError}
            </AppText>
          ) : null}

          <AppButton
            label={isDownloading ? 'Preparing…' : 'Download CSV'}
            onPress={() => void download()}
            loading={isDownloading}
            disabled={!canDownload}
            fullWidth
          />
        </AdminProductDetailCardShell>

        {error ? <ErrorState message={error} onAction={clearError} style={styles.error} /> : null}
      </ScrollView>

      <AdminCsvSchemaPickerSheet
        visible={schemaPickerVisible}
        selectedSchema={schema}
        onClose={() => setSchemaPickerVisible(false)}
        onSelect={setSchema}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  fieldError: {
    color: colors.error,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
