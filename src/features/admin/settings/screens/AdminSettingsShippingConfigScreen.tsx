import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminShippingMatrixModal } from '../components/AdminShippingMatrixModal';
import { AdminShippingTierCard } from '../components/AdminShippingTierCard';
import { AdminShippingTierFormModal } from '../components/AdminShippingTierFormModal';
import { useAdminShippingConfigEditor } from '../hooks/useAdminShippingConfigEditor';
import type { AdminShippingTierDraft } from '../types/adminShippingConfig';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsShippingConfig'>;

const RETURN_TO = authReturnTo.adminSettingsShippingConfig();

export function AdminSettingsShippingConfigScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  const {
    tiers,
    matrix,
    isLoading,
    isRefreshing,
    isSaving,
    isDirty,
    error,
    saveError,
    canSave,
    upsertTier,
    deleteTier,
    updateMatrixCell,
    saveAll,
    refresh,
    clearSaveError,
  } = useAdminShippingConfigEditor({ enabled: isAuthorized });

  const [tierModalVisible, setTierModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tierDraft, setTierDraft] = useState<AdminShippingTierDraft | null>(null);
  const [matrixOriginTier, setMatrixOriginTier] = useState<string | null>(null);

  const openAddTier = useCallback(() => {
    setEditingIndex(null);
    setTierDraft(null);
    setTierModalVisible(true);
  }, []);

  const openEditTier = useCallback((index: number) => {
    setEditingIndex(index);
    setTierDraft(tiers[index] ?? null);
    setTierModalVisible(true);
  }, [tiers]);

  const handleSaveAll = useCallback(async () => {
    const saved = await saveAll();
    if (saved) {
      Alert.alert('Saved', 'Shipping configuration saved successfully.');
    }
  }, [saveAll]);

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
        }
      >
        <AppText variant="bodyMedium" color="textSecondary">
          Manage shipping tiers and origin→destination surcharges. Changes are local until you tap Save All.
        </AppText>

        <AppButton label="Add tier" onPress={openAddTier} fullWidth />

        {isDirty ? (
          <AppText variant="caption" color="textSecondary">
            Unsaved changes — tap Save All to persist.
          </AppText>
        ) : null}

        {tiers.length === 0 && !isLoading ? (
          <EmptyState
            title="No tiers yet"
            message="Add a tier with countries, then configure surcharges in the matrix."
            actionLabel="Add tier"
            onAction={openAddTier}
          />
        ) : null}

        <View style={styles.tierList}>
          {tiers.map((tier, index) => (
            <AdminShippingTierCard
              key={`${tier.tierName}-${index}`}
              tier={tier}
              onEdit={() => openEditTier(index)}
              onMatrix={() => setMatrixOriginTier(tier.tierName)}
              onDelete={() => void deleteTier(index)}
            />
          ))}
        </View>

        {tiers.length > 0 ? (
          <AppButton
            label={isSaving ? 'Saving…' : 'Save All'}
            onPress={() => void handleSaveAll()}
            loading={isSaving}
            disabled={!canSave}
            fullWidth
          />
        ) : null}

        {saveError ? (
          <ErrorState message={saveError} onAction={clearSaveError} style={styles.error} />
        ) : null}

        {error && tiers.length === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.error} />
        ) : null}

        {isLoading && tiers.length === 0 && !error ? (
          <AppText variant="caption" color="textMuted">
            Loading shipping configuration…
          </AppText>
        ) : null}
      </ScrollView>

      <AdminShippingTierFormModal
        visible={tierModalVisible}
        initialDraft={tierDraft}
        editingIndex={editingIndex}
        existingTiers={tiers}
        onDismiss={() => setTierModalVisible(false)}
        onSave={upsertTier}
      />

      <AdminShippingMatrixModal
        visible={matrixOriginTier != null}
        originTierName={matrixOriginTier}
        tiers={tiers}
        matrix={matrix}
        onDismiss={() => setMatrixOriginTier(null)}
        onChangeCell={updateMatrixCell}
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
  tierList: {
    gap: spacing.md,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
