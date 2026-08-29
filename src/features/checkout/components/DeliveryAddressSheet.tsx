import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../components/ui/AppButton';
import { AppText } from '../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../design-system';
import { DeliveryAddressRow } from './DeliveryAddressRow';
import { SavedAddressForm } from './SavedAddressForm';
import { useDeliveryAddresses } from '../hooks/useDeliveryAddresses';
import type { AuthUser } from '../../auth/types';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import type { DeliveryAddressListItem, SavedAddressFormField, SavedAddressFormValues } from '../types/deliveryAddress';
import {
  deliveryAddressToFormValues,
  emptySavedAddressFormValues,
} from '../types/deliveryAddress';
import { validateSavedAddressForm, formatDeliveryAddressLine } from '../utils/deliveryAddressDisplay';

export interface DeliveryAddressSheetProps {
  visible: boolean;
  user?: AuthUser | null;
  userId?: string;
  onClose: () => void;
  onSelectAddress: (address: DeliveryAddressListItem) => Promise<void> | void;
}

type SheetMode = 'list' | 'form';

const SHEET_HEIGHT_RATIO = 0.82;
/** Handle, title row, and vertical gaps above the address list. */
const LIST_SHEET_HEADER_CHROME = 96;
/** Footer summary + Ship here until first `onLayout`. */
const LIST_SHEET_FOOTER_FALLBACK = 148;

function formatAddressRecipient(address: DeliveryAddressListItem): string {
  return [address.firstName, address.lastName].filter(Boolean).join(' ').trim() || 'Address';
}

export function DeliveryAddressSheet({
  visible,
  user,
  userId,
  onClose,
  onSelectAddress,
}: DeliveryAddressSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const resolvedUserId = userId ?? resolveAuthUserId(user);
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [mode, setMode] = useState<SheetMode>('list');
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressListItem | null>(null);
  const [formValues, setFormValues] = useState<SavedAddressFormValues>(emptySavedAddressFormValues());
  const [formErrors, setFormErrors] = useState<Partial<Record<SavedAddressFormField, string>>>({});
  const [listFooterHeight, setListFooterHeight] = useState(LIST_SHEET_FOOTER_FALLBACK);

  const listScrollMaxHeight = useMemo(
    () =>
      Math.max(
        160,
        sheetMaxHeight - LIST_SHEET_HEADER_CHROME - listFooterHeight - insets.bottom - spacing.md,
      ),
    [insets.bottom, listFooterHeight, sheetMaxHeight],
  );

  const formScrollMaxHeight = useMemo(
    () =>
      Math.max(
        220,
        sheetMaxHeight - LIST_SHEET_HEADER_CHROME - 72 - insets.bottom - spacing.md,
      ),
    [insets.bottom, sheetMaxHeight],
  );

  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    isLoading,
    isSaving,
    error,
    reload,
    selectAddress,
    saveAddress,
    deleteAddress,
  } = useDeliveryAddresses({ userId: resolvedUserId, enabled: visible });

  useEffect(() => {
    if (visible) {
      setMode('list');
      setEditingAddress(null);
      setFormValues(emptySavedAddressFormValues());
      setFormErrors({});
      void reload();
    }
  }, [reload, visible]);

  const selectedAddress = useMemo(
    () => addresses.find((item) => item._id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const openCreateForm = () => {
    setEditingAddress(null);
    setFormValues(emptySavedAddressFormValues());
    setFormErrors({});
    setMode('form');
  };

  const openEditForm = (address: DeliveryAddressListItem) => {
    setEditingAddress(address);
    setFormValues(deliveryAddressToFormValues(address));
    setFormErrors({});
    setMode('form');
  };

  const handleFormChange = (field: SavedAddressFormField, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSaveForm = async () => {
    const validationErrors = validateSavedAddressForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    await saveAddress(formValues, editingAddress);
    setMode('list');
    setEditingAddress(null);
  };

  const handleDelete = (address: DeliveryAddressListItem) => {
    Alert.alert(
      'Delete delivery address',
      'Are you sure you want to delete this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteAddress(address);
          },
        },
      ],
    );
  };

  const handleUseAddress = async () => {
    if (!selectedAddress) {
      return;
    }

    await selectAddress(selectedAddress);
    await onSelectAddress(selectedAddress);
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            {mode === 'form' ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setMode('list');
                  setEditingAddress(null);
                }}
              >
                <AppText variant="bodyMedium" color="textLink">
                  Back
                </AppText>
              </Pressable>
            ) : (
              <View style={styles.headerSpacer} />
            )}

            <AppText variant="h3" style={styles.title}>
              {mode === 'form' ? (editingAddress ? 'Edit address' : 'New address') : 'Choose delivery address'}
            </AppText>

            <Pressable accessibilityRole="button" onPress={onClose}>
              <AppText variant="bodyMedium" color="textLink">
                Close
              </AppText>
            </Pressable>
          </View>

          {mode === 'list' ? (
            <>
              {!resolvedUserId ? (
                <AppText variant="body" color="error" style={styles.emptyCopy}>
                  We could not determine your account ID. Sign out and sign in again, then retry.
                </AppText>
              ) : isLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <AppText variant="bodySmall" color="textSecondary">
                    Loading addresses...
                  </AppText>
                </View>
              ) : (
                <ScrollView
                  style={[styles.scrollArea, { maxHeight: listScrollMaxHeight }]}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  bounces
                >
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <DeliveryAddressRow
                        key={`${address.id}-${address._id ?? 'default'}`}
                        address={address}
                        selected={selectedAddressId === address._id}
                        onSelect={() => {
                          if (address._id) {
                            setSelectedAddressId(address._id);
                          }
                        }}
                        onEdit={() => openEditForm(address)}
                        onDelete={() => handleDelete(address)}
                        showActions
                      />
                    ))
                  ) : (
                    <AppText variant="body" color="textSecondary" style={styles.emptyCopy}>
                      No saved addresses found.
                    </AppText>
                  )}

                  <Pressable accessibilityRole="button" onPress={openCreateForm} style={styles.addAddressButton}>
                    <AppText variant="bodyMedium" color="textLink">
                      + Add a new address
                    </AppText>
                  </Pressable>
                </ScrollView>
              )}

              <View
                style={styles.listFooterBlock}
                onLayout={(event) => {
                  const measuredHeight = Math.ceil(event.nativeEvent.layout.height);
                  if (measuredHeight > 0 && measuredHeight !== listFooterHeight) {
                    setListFooterHeight(measuredHeight);
                  }
                }}
              >
                {error ? (
                  <AppText variant="bodySmall" color="error">
                    {error}
                  </AppText>
                ) : null}

                <View style={styles.footerSummary}>
                  <AppText variant="caption" color="textMuted" style={styles.footerSummaryLabel}>
                    Selected address
                  </AppText>
                  {selectedAddress ? (
                    <>
                      <AppText variant="bodyMedium" style={styles.footerSummaryName} numberOfLines={1}>
                        {formatAddressRecipient(selectedAddress)}
                      </AppText>
                      <AppText variant="bodySmall" color="textSecondary" numberOfLines={2}>
                        {formatDeliveryAddressLine(selectedAddress)}
                      </AppText>
                    </>
                  ) : (
                    <AppText variant="bodySmall" color="textSecondary">
                      Choose an address from your saved list.
                    </AppText>
                  )}
                </View>

                <AppButton
                  label="Ship here"
                  fullWidth
                  size="lg"
                  shape="pill"
                  disabled={!selectedAddress || isSaving || !resolvedUserId}
                  onPress={() => void handleUseAddress()}
                />
              </View>
            </>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.formBody}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            >
              <ScrollView
                style={[styles.scrollArea, { maxHeight: formScrollMaxHeight }]}
                contentContainerStyle={styles.formContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                bounces
              >
                <SavedAddressForm value={formValues} errors={formErrors} onChange={handleFormChange} disabled={isSaving} />

                {error ? (
                  <AppText variant="bodySmall" color="error">
                    {error}
                  </AppText>
                ) : null}
              </ScrollView>

              <AppButton
                label={isSaving ? 'Saving...' : 'Save address'}
                fullWidth
                size="lg"
                shape="pill"
                disabled={isSaving}
                onPress={() => void handleSaveForm()}
              />
            </KeyboardAvoidingView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerSpacer: {
    width: 48,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  scrollArea: {
    flexGrow: 0,
  },
  formBody: {
    gap: spacing.md,
    flexShrink: 1,
    minHeight: 0,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  listFooterBlock: {
    gap: spacing.md,
    flexShrink: 0,
  },
  addAddressButton: {
    paddingVertical: spacing.sm,
  },
  emptyCopy: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  formContent: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  footerSummary: {
    gap: 2,
    paddingTop: spacing.xs,
  },
  footerSummaryLabel: {
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  footerSummaryName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
