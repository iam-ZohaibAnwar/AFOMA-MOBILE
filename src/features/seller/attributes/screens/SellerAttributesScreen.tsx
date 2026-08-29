import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
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
import { SellerAttributeRenameModal } from '../components/SellerAttributeRenameModal';
import { SellerAttributeRow } from '../components/SellerAttributeRow';
import { useSellerAttributes } from '../hooks/useSellerAttributes';
import type { SellerAttributeListItem } from '../types/sellerAttribute';
import {
  findAttributeByIndex,
  normalizeAttributeName,
  validateAddAttributeName,
  validateRenameAttributeName,
} from '../utils/sellerAttributeValidation';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerAttributes'>;

const ATTRIBUTES_RETURN_TO = authReturnTo.sellerAttributes();

function ActionErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.actionErrorBanner}>
      <AppText variant="bodySmall" color="error" style={styles.actionErrorText}>
        {message}
      </AppText>
      <AppButton label="Dismiss" variant="ghost" size="md" onPress={onDismiss} />
    </View>
  );
}

export function SellerAttributesScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  const [newAttributeName, setNewAttributeName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<SellerAttributeListItem | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized && sellerId) {
        void refresh();
      }
    }, [isAuthorized, refresh, sellerId]),
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollAddFieldIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const keyboardPadding =
    Platform.OS === 'ios' ? keyboardHeight : keyboardHeight > 0 ? spacing.xxl : 0;

  const closeRenameModal = useCallback(() => {
    setRenameTarget(null);
    setRenameError(null);
  }, []);

  const attributeNames = attributes.map((attribute) => attribute.name);
  const isMutationBusy = isAdding || updatingIndex != null || deletingName != null;

  const handleAdd = async () => {
    clearActionError();
    setAddError(null);

    const validationError = validateAddAttributeName(newAttributeName, attributeNames);
    if (validationError) {
      setAddError(validationError);
      return;
    }

    const normalizedName = normalizeAttributeName(newAttributeName);
    const created = await createAttribute(normalizedName);

    if (created) {
      setNewAttributeName('');
      setAddError(null);
    }
  };

  const handleRenameOpen = (entry: SellerAttributeListItem) => {
    clearActionError();
    setRenameError(null);
    setRenameTarget(entry);
  };

  const handleRenameSave = async (rawName: string) => {
    if (!renameTarget) {
      return;
    }

    setRenameError(null);
    clearActionError();

    const currentEntry = findAttributeByIndex(attributes, renameTarget.index);
    if (!currentEntry) {
      setRenameError('This attribute was updated elsewhere. Refresh and try again.');
      return;
    }

    const validationError = validateRenameAttributeName(rawName, attributeNames, renameTarget.index);
    if (validationError) {
      setRenameError(validationError);
      return;
    }

    const normalizedName = normalizeAttributeName(rawName);
    const updated = await renameAttribute(renameTarget.index, normalizedName);

    if (updated) {
      closeRenameModal();
    }
  };

  const handleDeletePress = (entry: SellerAttributeListItem) => {
    if (isMutationBusy) {
      return;
    }

    Alert.alert(
      'Delete attribute',
      `Remove "${entry.name}" from your custom attributes? Existing product variations are not updated automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              clearActionError();
              const deleted = await removeAttribute(entry.name);

              if (renameTarget?.index === entry.index && deleted) {
                closeRenameModal();
              }
            })();
          },
        },
      ],
    );
  };

  if (!isAuthorized) {
    return <View style={[styles.screen, { paddingTop: insets.top }]} />;
  }

  if (isLoading && attributes.length === 0 && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading custom attributes…
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
    <>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl + keyboardPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
          }
        >
          <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
            Define variation options like Size or Color for your customizable products.
          </AppText>

          {attributes.length > 0 ? (
            <AppText variant="bodySmall" color="textSecondary" style={styles.countText}>
              {attributes.length} {attributes.length === 1 ? 'attribute' : 'attributes'}
            </AppText>
          ) : null}

          {error ? (
            <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
          ) : null}

          {actionError ? (
            <ActionErrorBanner message={actionError} onDismiss={clearActionError} />
          ) : null}

          <AppCard variant="flat" style={styles.listCard}>
            {attributes.length === 0 ? (
              <EmptyState
                title="No custom attributes yet"
                message="Add your first variation option below."
                style={styles.emptyState}
              />
            ) : (
              attributes.map((attribute, index) => (
                <SellerAttributeRow
                  key={`${attribute.index}-${attribute.name}`}
                  name={attribute.name}
                  index={attribute.index}
                  onRename={() => handleRenameOpen(attribute)}
                  onDelete={() => handleDeletePress(attribute)}
                  isRenaming={updatingIndex === attribute.index}
                  isDeleting={deletingName === attribute.name}
                  disabled={
                    isMutationBusy &&
                    updatingIndex !== attribute.index &&
                    deletingName !== attribute.name
                  }
                  showDivider={index < attributes.length - 1}
                />
              ))
            )}
          </AppCard>

          <View style={styles.addBlock}>
            <AppInput
              value={newAttributeName}
              tone="surface"
              onChangeText={(text) => {
                setNewAttributeName(text);
                setAddError(null);
                clearActionError();
              }}
              onFocus={scrollAddFieldIntoView}
              placeholder="Attribute name"
              editable={!isMutationBusy}
              error={addError ?? undefined}
            />

            <AppButton
              label={isAdding ? 'Adding…' : 'Add attribute'}
              onPress={() => void handleAdd()}
              loading={isAdding}
              disabled={isMutationBusy}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>

      <SellerAttributeRenameModal
        visible={renameTarget != null}
        initialName={renameTarget?.name ?? ''}
        isSaving={updatingIndex != null}
        error={renameError}
        onDismiss={closeRenameModal}
        onSave={(nextName) => void handleRenameSave(nextName)}
        onClearError={() => setRenameError(null)}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  lead: {
    marginBottom: spacing.xs,
  },
  countText: {
    fontWeight: '600',
    marginTop: -spacing.sm,
  },
  inlineError: {
    marginBottom: 0,
  },
  actionErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  actionErrorText: {
    flex: 1,
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  addBlock: {
    gap: spacing.md,
  },
});
