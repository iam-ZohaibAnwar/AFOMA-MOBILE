import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, shadows, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { DeliveryAddressRow } from '../../checkout/components/DeliveryAddressRow';
import { SavedAddressFormSheet } from '../../checkout/components/SavedAddressFormSheet';
import { useDeliveryAddresses } from '../../checkout/hooks/useDeliveryAddresses';
import type { DeliveryAddressListItem, SavedAddressFormField, SavedAddressFormValues } from '../../checkout/types/deliveryAddress';
import {
  deliveryAddressToFormValues,
  emptySavedAddressFormValues,
} from '../../checkout/types/deliveryAddress';
import { validateSavedAddressForm, formatDeliveryAddressLine } from '../../checkout/utils/deliveryAddressDisplay';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'AddressBook'>;

const ADDRESS_BOOK_RETURN_TO = authReturnTo.addressBook();

function formatAddressRecipient(address: DeliveryAddressListItem): string {
  return [address.firstName, address.lastName].filter(Boolean).join(' ').trim() || 'Address';
}

export function AddressBookScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { isAuthorized } = useRequireAuth(ADDRESS_BOOK_RETURN_TO);
  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);

  const [formSheetVisible, setFormSheetVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddressListItem | null>(null);
  const [formValues, setFormValues] = useState<SavedAddressFormValues>(emptySavedAddressFormValues());
  const [formErrors, setFormErrors] = useState<Partial<Record<SavedAddressFormField, string>>>({});
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
  } = useDeliveryAddresses({ userId: authUserId, enabled: isAuthorized });

  const selectedAddress = useMemo(
    () => addresses.find((item) => item._id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const openCreateForm = useCallback(() => {
    setEditingAddress(null);
    setFormValues(emptySavedAddressFormValues());
    setFormErrors({});
    setSaveMessage(null);
    setFormSheetVisible(true);
  }, []);

  const showAddressActions = useCallback(() => {
    Alert.alert('Address options', undefined, [
      { text: 'Add new address', onPress: openCreateForm },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [openCreateForm]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Address options"
          onPress={showAddressActions}
          hitSlop={8}
          style={styles.headerAction}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
        </Pressable>
      ),
    });
  }, [navigation, showAddressActions]);

  const openEditForm = (address: DeliveryAddressListItem) => {
    setEditingAddress(address);
    setFormValues(deliveryAddressToFormValues(address));
    setFormErrors({});
    setSaveMessage(null);
    setFormSheetVisible(true);
  };

  const closeFormSheet = () => {
    if (isSaving) {
      return;
    }

    setFormSheetVisible(false);
    setEditingAddress(null);
    setFormErrors({});
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

    try {
      await saveAddress(formValues, editingAddress);
      setSaveMessage(editingAddress ? 'Address updated successfully.' : 'Address added successfully.');
      setFormSheetVisible(false);
      setEditingAddress(null);
    } catch {
      // Error surfaced via hook state.
    }
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

  const handleSelectAddress = useCallback((address: DeliveryAddressListItem) => {
    if (!address._id) {
      return;
    }

    setSelectedAddressId(address._id);
    setSelectionMessage(null);
  }, [setSelectedAddressId]);

  const handleUseSelectedAddress = async () => {
    if (!selectedAddress) {
      return;
    }

    await selectAddress(selectedAddress);
    setSelectionMessage('Delivery address updated.');
  };

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onMarketplaceScroll}
        {...marketplaceScrollProps}
      >
        {selectionMessage ? (
          <AppCard variant="flat" style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {selectionMessage}
            </AppText>
          </AppCard>
        ) : null}

        {saveMessage ? (
          <AppCard variant="flat" style={styles.successBanner}>
            <AppText variant="bodySmall" color="success">
              {saveMessage}
            </AppText>
          </AppCard>
        ) : null}

        <View style={styles.section}>
          {!authUserId ? (
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
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a new address"
                onPress={openCreateForm}
                style={styles.addAddressCard}
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                <AppText variant="bodyMedium" color="textLink" style={styles.addAddressLabel}>
                  Add a new address
                </AppText>
              </Pressable>

              {addresses.length > 0 ? (
                <View style={styles.addressList}>
                  {addresses.map((address) => (
                    <DeliveryAddressRow
                      key={`${address.id}-${address._id ?? 'default'}`}
                      address={address}
                      selected={selectedAddressId === address._id}
                      variant="card"
                      onSelect={() => handleSelectAddress(address)}
                      onEdit={address.isDefault ? undefined : () => openEditForm(address)}
                      onDelete={address.isDefault ? undefined : () => handleDelete(address)}
                    />
                  ))}
                </View>
              ) : (
                <AppText variant="body" color="textSecondary" style={styles.emptyCopy}>
                  No saved addresses found.
                </AppText>
              )}
            </>
          )}

          {error ? (
            <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerInset + spacing.md }]}>
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
          label="Use selected address"
          fullWidth
          size="lg"
          disabled={!selectedAddress || isSaving || !authUserId}
          loading={isSaving}
          onPress={() => void handleUseSelectedAddress()}
        />
      </View>

      <SavedAddressFormSheet
        visible={formSheetVisible}
        title={editingAddress ? 'Edit address' : 'New address'}
        value={formValues}
        errors={formErrors}
        isSaving={isSaving}
        errorMessage={error}
        onChange={handleFormChange}
        onSave={() => void handleSaveForm()}
        onClose={closeFormSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  headerAction: {
    paddingHorizontal: spacing.xs,
  },
  addressList: {
    gap: spacing.md,
  },
  addAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addAddressLabel: {
    fontWeight: '600',
  },
  emptyCopy: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  inlineError: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
    marginTop: spacing.md,
  },
  successBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.successSoft,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadows.floating,
  },
  footerSummary: {
    gap: 2,
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
});
