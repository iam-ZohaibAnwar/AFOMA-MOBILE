import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import { authReturnTo } from '../../../auth/utils/authNavigation';
import { useRequireAdmin } from '../../hooks/useRequireAdmin';
import type { AdminStackParamList } from '../../navigation/adminTypes';
import { AdminGlobalAttributeRenameModal } from '../components/AdminGlobalAttributeRenameModal';
import { AdminGlobalAttributeRow } from '../components/AdminGlobalAttributeRow';
import { useAdminGlobalAttributes } from '../hooks/useAdminGlobalAttributes';
import type { GlobalAttributeEntry } from '../types/adminGlobalAttributes';
import {
  findGlobalAttributeEntryByRawIndex,
  normalizeGlobalAttributeName,
  validateAddGlobalAttributeName,
  validateRenameGlobalAttributeName,
} from '../utils/adminGlobalAttributeValidation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminGlobalAttributes'>;

const RETURN_TO = authReturnTo.adminGlobalAttributes();

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

export function AdminGlobalAttributesScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const scrollRef = useRef<ScrollView>(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const { isAuthorized } = useRequireAdmin(RETURN_TO);
  const {
    documentId,
    attributeNames,
    entries,
    isLoading,
    isRefreshing,
    isAdding,
    renamingRawIndex,
    deletingName,
    error,
    actionError,
    refresh,
    addAttributeName,
    renameAttributeAtIndex,
    deleteAttributeName,
    clearActionError,
  } = useAdminGlobalAttributes({ enabled: isAuthorized });

  const [newAttributeName, setNewAttributeName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<GlobalAttributeEntry | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isAuthorized) {
        void refresh();
      }
    }, [isAuthorized, refresh]),
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      if (Platform.OS === 'android') {
        setKeyboardInset(event.endCoordinates.height);
      }

      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
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

  const closeRenameModal = useCallback(() => {
    setRenameTarget(null);
    setRenameError(null);
  }, []);

  const isMutationBusy = isAdding || renamingRawIndex != null || deletingName != null;

  const handleAdd = async () => {
    clearActionError();
    setAddError(null);

    const validationError = validateAddGlobalAttributeName(newAttributeName, attributeNames);
    if (validationError) {
      setAddError(validationError);
      return;
    }

    if (!documentId) {
      setAddError('Global attributes are unavailable right now.');
      return;
    }

    const normalizedName = normalizeGlobalAttributeName(newAttributeName);
    const created = await addAttributeName(normalizedName);

    if (created) {
      setNewAttributeName('');
      setAddError(null);
    }
  };

  const handleRenameOpen = (entry: GlobalAttributeEntry) => {
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

    const currentEntry = findGlobalAttributeEntryByRawIndex(entries, renameTarget.rawIndex);
    if (!currentEntry) {
      setRenameError('This attribute was updated elsewhere. Refresh and try again.');
      return;
    }

    const validationError = validateRenameGlobalAttributeName(rawName, entries, renameTarget.rawIndex);
    if (validationError) {
      setRenameError(validationError);
      return;
    }

    const normalizedName = normalizeGlobalAttributeName(rawName);
    const updated = await renameAttributeAtIndex(renameTarget.rawIndex, normalizedName);

    if (updated) {
      closeRenameModal();
    }
  };

  const handleDeletePress = (entry: GlobalAttributeEntry) => {
    if (isMutationBusy) {
      return;
    }

    Alert.alert(
      'Delete attribute',
      `Remove "${entry.name}" from the global attribute list? Existing product variations are not updated automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              clearActionError();
              const deleted = await deleteAttributeName(entry.name);

              if (renameTarget?.rawIndex === entry.rawIndex && deleted) {
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

  if (isLoading && entries.length === 0 && !error) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <AppText variant="bodySmall" color="textSecondary">
          Loading global attributes…
        </AppText>
      </View>
    );
  }

  if (error && entries.length === 0) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void refresh()} />
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: insets.bottom + spacing.xxl + keyboardInset,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.primary}
            />
          }
        >
        <AppText variant="bodyMedium" color="textSecondary" style={styles.lead}>
          Manage the attributes available across the marketplace.
        </AppText>

        {error ? (
          <ErrorState message={error} onAction={() => void refresh()} style={styles.inlineError} />
        ) : null}

        {actionError ? (
          <ActionErrorBanner message={actionError} onDismiss={clearActionError} />
        ) : null}

        {!documentId && !isLoading ? (
          <ErrorState
            message="Global attribute configuration is unavailable."
            onAction={() => void refresh()}
            style={styles.inlineError}
          />
        ) : null}

        <AppCard variant="flat" style={styles.listCard}>
          {entries.length === 0 ? (
            <EmptyState
              title="No global attributes yet"
              message="Add the first platform-wide variation name."
              style={styles.emptyState}
            />
          ) : (
            entries.map((entry, index) => (
              <AdminGlobalAttributeRow
                key={`${entry.rawIndex}-${entry.name}`}
                name={entry.name}
                rawIndex={entry.rawIndex}
                onRename={() => handleRenameOpen(entry)}
                onDelete={() => handleDeletePress(entry)}
                isRenaming={renamingRawIndex === entry.rawIndex}
                isDeleting={deletingName === entry.name}
                disabled={isMutationBusy && renamingRawIndex !== entry.rawIndex && deletingName !== entry.name}
                showDivider={index < entries.length - 1}
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
            editable={!isMutationBusy && Boolean(documentId)}
            error={addError ?? undefined}
          />

          <AppButton
            label={isAdding ? 'Adding…' : 'Add attribute'}
            onPress={() => void handleAdd()}
            loading={isAdding}
            disabled={isMutationBusy || !documentId}
            fullWidth
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AdminGlobalAttributeRenameModal
        visible={renameTarget != null}
        initialName={renameTarget?.name ?? ''}
        isSaving={renamingRawIndex != null}
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
