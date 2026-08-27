import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppButton } from '../../../components/ui/AppButton';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import {
  marketplaceScrollProps,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { resolveAuthUserId } from '../../auth/utils/resolveAuthUserId';
import { DeliveryAddressRow } from '../../checkout/components/DeliveryAddressRow';
import { SavedAddressForm } from '../../checkout/components/SavedAddressForm';
import { useDeliveryAddresses } from '../../checkout/hooks/useDeliveryAddresses';
import type { DeliveryAddressListItem, SavedAddressFormField, SavedAddressFormValues } from '../../checkout/types/deliveryAddress';
import {
  deliveryAddressToFormValues,
  emptySavedAddressFormValues,
} from '../../checkout/types/deliveryAddress';
import { validateSavedAddressForm } from '../../checkout/utils/deliveryAddressDisplay';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'AddressBook'>;

type ScreenMode = 'list' | 'form';

const ADDRESS_BOOK_RETURN_TO = authReturnTo.addressBook();

export function AddressBookScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const onMarketplaceScroll = useMarketplaceScrollHandler();
  const { isAuthorized } = useRequireAuth(ADDRESS_BOOK_RETURN_TO);
  const { user } = useAuth();
  const authUserId = resolveAuthUserId(user);

  const [mode, setMode] = useState<ScreenMode>('list');
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

  const openCreateForm = () => {
    setEditingAddress(null);
    setFormValues(emptySavedAddressFormValues());
    setFormErrors({});
    setSaveMessage(null);
    setMode('form');
  };

  const openEditForm = (address: DeliveryAddressListItem) => {
    setEditingAddress(address);
    setFormValues(deliveryAddressToFormValues(address));
    setFormErrors({});
    setSaveMessage(null);
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

    try {
      await saveAddress(formValues, editingAddress);
      setSaveMessage(editingAddress ? 'Address updated successfully.' : 'Address added successfully.');
      setMode('list');
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

  const handleSelectAddress = useCallback(async (address: DeliveryAddressListItem) => {
    if (!address._id) {
      return;
    }

    setSelectedAddressId(address._id);
    await selectAddress(address);
    setSelectionMessage('Delivery address updated.');
  }, [selectAddress, setSelectedAddressId]);

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

  if (mode === 'form') {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onMarketplaceScroll}
          {...marketplaceScrollProps}
        >
          <AppCard variant="flat">
            <AppText variant="label" style={styles.sectionTitle}>
              {editingAddress ? 'Edit address' : 'New address'}
            </AppText>
            <SavedAddressForm
              tone="surface"
              value={formValues}
              errors={formErrors}
              onChange={handleFormChange}
              disabled={isSaving}
            />
          </AppCard>

          {error ? <ErrorState message={error} style={styles.banner} /> : null}

          <View style={styles.formActions}>
            <AppButton
              label="Back"
              variant="outline"
              onPress={() => {
                setMode('list');
                setEditingAddress(null);
              }}
              disabled={isSaving}
              style={styles.formActionButton}
            />
            <AppButton
              label={isSaving ? 'Saving...' : 'Save address'}
              loading={isSaving}
              onPress={() => void handleSaveForm()}
              style={styles.formActionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
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
          <AppText variant="label" style={styles.sectionTitle}>
            Saved addresses
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.sectionCopy}>
            Choose a delivery address for checkout. Your profile address is included as the default.
          </AppText>

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
          ) : addresses.length > 0 ? (
            <View style={styles.addressList}>
              {addresses.map((address) => (
                <DeliveryAddressRow
                  key={`${address.id}-${address._id ?? 'default'}`}
                  address={address}
                  selected={selectedAddressId === address._id}
                  variant="card"
                  onSelect={() => void handleSelectAddress(address)}
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

          {error ? (
            <ErrorState message={error} onAction={() => void reload()} style={styles.inlineError} />
          ) : null}

          <Pressable accessibilityRole="button" onPress={openCreateForm} style={styles.addAddressButton}>
            <AppText variant="bodyMedium" color="textLink" style={styles.addAddressLabel}>
              + Add a new address
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <AppButton
          label="Use selected address"
          fullWidth
          size="lg"
          disabled={!selectedAddress || isSaving || !authUserId}
          loading={isSaving}
          onPress={() => void handleUseSelectedAddress()}
        />
      </View>
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
  sectionCopy: {
    lineHeight: 20,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  addressList: {
    gap: spacing.md,
  },
  addAddressButton: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  addAddressLabel: {
    fontWeight: '600',
  },
  emptyCopy: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  banner: {
    alignSelf: 'stretch',
    marginHorizontal: 0,
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
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formActionButton: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
