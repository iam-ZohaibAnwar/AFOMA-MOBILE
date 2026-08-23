import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import type { SellerStackParamList } from '../../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireSeller } from '../../hooks/useRequireSeller';
import { SellerAttributeRow } from '../components/SellerAttributeRow';
import { useSellerAttributes } from '../hooks/useSellerAttributes';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerAttributes'>;

const ATTRIBUTES_RETURN_TO = authReturnTo.sellerAttributes();

export function SellerAttributesScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(ATTRIBUTES_RETURN_TO);
  const {
    attributes,
    isLoading,
    isRefreshing,
    isAdding,
    updatingIndex,
    deletingName,
    error,
    actionError,
    refresh,
    createAttribute,
    renameAttribute,
    removeAttribute,
    clearActionError,
  } = useSellerAttributes(isAuthorized ? sellerId : undefined);

  const [attributeName, setAttributeName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  const isEditing = editingIndex != null;
  const isFormBusy = isAdding || updatingIndex != null;

  const resetForm = () => {
    setAttributeName('');
    setEditingIndex(null);
    clearActionError();
  };

  const handleSubmit = async () => {
    clearActionError();

    if (isEditing && editingIndex != null) {
      const updated = await renameAttribute(editingIndex, attributeName);
      if (updated) {
        resetForm();
      }
      return;
    }

    const created = await createAttribute(attributeName);
    if (created) {
      resetForm();
    }
  };

  const handleEdit = (index: number, name: string) => {
    setEditingIndex(index);
    setAttributeName(name);
    clearActionError();
  };

  const handleDelete = async (name: string) => {
    const deleted = await removeAttribute(name);
    if (deleted && editingIndex != null && attributes[editingIndex]?.name === name) {
      resetForm();
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && attributes.length === 0 && !error) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="bodySmall" color="textSecondary">
          Loading custom attributes...
        </AppText>
      </View>
    );
  }

  if (error && attributes.length === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
    >
      <AppText variant="bodyMedium" style={styles.pageTitle}>
        Custom Attributes
      </AppText>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          {isEditing ? 'Edit custom attribute' : 'Create a custom attribute'}
        </AppText>

        <View style={styles.formBlock}>
          <AppInput
            value={attributeName}
            onChangeText={(text) => {
              setAttributeName(text);
              clearActionError();
            }}
            placeholder="Attribute name"
            editable={!isFormBusy}
            error={actionError ?? undefined}
          />

          <AppButton
            label={isEditing ? 'Update' : 'Add'}
            onPress={() => void handleSubmit()}
            loading={isFormBusy}
            disabled={isFormBusy || deletingName != null}
            fullWidth
          />

          {isEditing ? (
            <AppButton
              label="Cancel edit"
              variant="ghost"
              onPress={resetForm}
              disabled={isFormBusy}
            />
          ) : null}
        </View>
      </AppCard>

      <AppCard variant="flat">
        <AppText variant="bodyMedium" style={styles.sectionTitle}>
          Your attributes
        </AppText>

        {error ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null}

        {attributes.length === 0 ? (
          <EmptyState
            title="No custom attributes yet"
            message="Create your first attribute."
            style={styles.emptyState}
          />
        ) : (
          <View>
            {attributes.map((attribute) => (
              <SellerAttributeRow
                key={`${attribute.index}-${attribute.name}`}
                name={attribute.name}
                onEdit={() => handleEdit(attribute.index, attribute.name)}
                onDelete={() => void handleDelete(attribute.name)}
                isUpdating={updatingIndex === attribute.index}
                isDeleting={deletingName === attribute.name}
                disabled={isFormBusy || (deletingName != null && deletingName !== attribute.name)}
              />
            ))}
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  formBlock: {
    gap: spacing.md,
  },
  inlineError: {
    marginBottom: spacing.md,
  },
  emptyState: {
    marginTop: spacing.sm,
  },
});
