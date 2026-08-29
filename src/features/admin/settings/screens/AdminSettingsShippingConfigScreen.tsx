import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { AdminProductDetailCardShell } from '../../product-management/components/detail/AdminProductDetailCardShell';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminSettingsDetailHero } from '../components/AdminSettingsDetailHero';
import { AdminShippingMatrixModal } from '../components/AdminShippingMatrixModal';
import { AdminShippingTierCard } from '../components/AdminShippingTierCard';
import { AdminShippingTierFormModal } from '../components/AdminShippingTierFormModal';
import { useAdminShippingConfigEditor } from '../hooks/useAdminShippingConfigEditor';
import type { AdminShippingTierDraft } from '../types/adminShippingConfig';
import { formatAdminShippingTiersMeta } from '../utils/adminSettingsDisplay';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminSettingsShippingConfig'>;

const RETURN_TO = authReturnTo.adminSettingsShippingConfig();

export function AdminSettingsShippingConfigScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAdmin(RETURN_TO);

  const {
    tiers,
    matrix,
    isLoading,
    hasLoaded,
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

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

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

  const statusMeta = formatAdminShippingTiersMeta(tiers.length);

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
        <AdminSettingsDetailHero
          title="Shipping Matrix"
          icon="globe-outline"
          statusLabel={statusMeta.label}
          statusIcon={statusMeta.icon}
        />

        <View style={styles.toolbar}>
          <AppButton label="Add tier" onPress={openAddTier} fullWidth />
        </View>

        {isDirty ? (
          <AppText variant="caption" color="textSecondary">
            Unsaved changes — tap Save All to persist.
          </AppText>
        ) : null}

        {hasLoaded && tiers.length === 0 ? (
          <EmptyState
            title="No tiers yet"
            message="Add a tier with countries, then configure surcharges in the matrix."
            actionLabel="Add tier"
            onAction={openAddTier}
          />
        ) : null}

        {tiers.length > 0 ? (
          <AdminProductDetailCardShell title="Shipping tiers" icon="layers-outline" accent>
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
          </AdminProductDetailCardShell>
        ) : null}

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

        {error && hasLoaded && tiers.length === 0 ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.error} />
        ) : null}

        {!hasLoaded ? (
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
  toolbar: {
    gap: spacing.sm,
  },
  tierList: {
    gap: spacing.md,
  },
  error: {
    marginHorizontal: 0,
    alignSelf: 'stretch',
  },
});
