import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { useAuth } from '../../../auth/hooks/useAuth';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../../auth/utils/resolveAuthUserId';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { useAdminCommissionRateEditor } from '../hooks/useAdminCommissionRateEditor';
import { ADMIN_COMMISSION_RATE_MAX, ADMIN_COMMISSION_RATE_MIN } from '../utils/adminSettingsConstants';
import { getAdminCommissionRateSettingLabel } from '../utils/adminSettingsContent';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsCommissionRate'>;

export function AdminSettingsCommissionRateScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { rateType } = route.params;
  const returnTo = authReturnTo.adminSettingsCommissionRate(rateType);
  const { isAuthorized } = useRequireAdmin(returnTo);
  const { user } = useAuth();
  const createdBy = resolveAuthUserId(user);

  const {
    inputValue,
    fieldError,
    saveError,
    error: loadError,
    isLoading,
    isRefreshing,
    isSaving,
    canSave,
    handleInputChange,
    save,
    refresh,
    clearSaveError,
  } = useAdminCommissionRateEditor(rateType, {
    enabled: isAuthorized,
    createdBy,
  });

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  const title = getAdminCommissionRateSettingLabel(rateType);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
    >
      <AppText variant="bodyMedium" color="textSecondary">
        Set the commission percentage ({ADMIN_COMMISSION_RATE_MIN}–{ADMIN_COMMISSION_RATE_MAX}%).
      </AppText>

      <AppCard variant="muted" style={styles.card}>
        <AppText variant="bodyMedium" style={styles.label}>
          {title}
        </AppText>

        <AppInput
          label="Commission %"
          value={inputValue}
          onChangeText={handleInputChange}
          keyboardType="number-pad"
          placeholder="0"
          editable={!isSaving}
          error={fieldError ?? undefined}
          maxLength={2}
        />

        <AppButton
          label={isSaving ? 'Saving…' : 'Save'}
          onPress={() => void save()}
          loading={isSaving}
          disabled={!canSave}
          fullWidth
        />
      </AppCard>

      {saveError ? (
        <ErrorState message={saveError} onAction={clearSaveError} style={styles.error} />
      ) : null}

      {loadError && !inputValue ? (
        <ErrorState message={loadError} onAction={() => void refresh()} style={styles.error} />
      ) : null}

      {isLoading && !inputValue && !loadError ? (
        <AppText variant="caption" color="textMuted">
          Loading current rate…
        </AppText>
      ) : null}
    </ScrollView>
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
  card: {
    gap: spacing.lg,
  },
  label: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
