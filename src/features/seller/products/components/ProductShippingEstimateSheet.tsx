import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

import { SelectField } from '../../../../components/forms';
import { AppButton } from '../../../../components/ui/AppButton';
import { AppCard } from '../../../../components/ui/AppCard';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, shadows, spacing } from '../../../../design-system';
import { useProductShippingEstimate } from '../hooks/useProductShippingEstimate';
import type { ProductShippingEstimatePrefill } from '../types/productShippingEstimate';
import { productShippingEstimateFormFromPrefill } from '../types/productShippingEstimate';
import {
  formatEstimateAmount,
  formatEstimateError,
} from '../utils/productShippingEstimateMappers';

export interface ProductShippingEstimateSheetProps {
  visible: boolean;
  sellerId?: string;
  prefill: ProductShippingEstimatePrefill;
  price?: string;
  onClose: () => void;
}

const SHEET_HEIGHT_RATIO = 0.92;

function EstimateResultCard({
  title,
  amount,
  error,
  serviceName,
}: {
  title: string;
  amount: string | null;
  error: string | null;
  serviceName?: string;
}) {
  if (!amount && !error) {
    return null;
  }

  return (
    <AppCard variant="muted" style={styles.resultCard}>
      <AppText variant="bodyMedium" style={styles.resultTitle}>
        {title}
      </AppText>
      {error ? (
        <AppText variant="bodySmall" color="warning">
          {error}
        </AppText>
      ) : amount ? (
        <AppText variant="bodyMedium" style={styles.resultAmount}>
          {amount}
        </AppText>
      ) : null}
      {serviceName && !error ? (
        <AppText variant="caption" color="textSecondary">
          {serviceName}
        </AppText>
      ) : null}
    </AppCard>
  );
}

export function ProductShippingEstimateSheet({
  visible,
  sellerId,
  prefill,
  price,
  onClose,
}: ProductShippingEstimateSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetMaxHeight = Math.round(windowHeight * SHEET_HEIGHT_RATIO);
  const [form, setForm] = useState(() => productShippingEstimateFormFromPrefill(prefill));

  const {
    destinationOptions,
    isLoadingDestinations,
    destinationsError,
    isFetchingEstimate,
    estimateError,
    dhlEstimate,
    freightComEstimate,
    fetchEstimate,
    resetResults,
    reloadDestinations,
  } = useProductShippingEstimate(sellerId, visible, price);

  useEffect(() => {
    if (visible) {
      setForm(productShippingEstimateFormFromPrefill(prefill));
      resetResults();
    }
  }, [prefill, resetResults, visible]);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    resetResults();
  };

  const destinationPlaceholder = isLoadingDestinations
    ? 'Loading countries...'
    : destinationOptions.length === 0
      ? 'No destinations available'
      : 'Select country';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <View
          style={[
            styles.sheet,
            shadows.modal,
            { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Shipping estimate
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.copy}>
            Optional preview only. Product creation is not blocked by this tool.
          </AppText>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <SelectField tone="surface"
              label="Ship to"
              value={form.destinationCountry}
              options={destinationOptions}
              onChange={(value) => updateField('destinationCountry', value)}
              placeholder={destinationPlaceholder}
              disabled={isLoadingDestinations || destinationOptions.length === 0}
              modalTitle="Ship to"
            />

            {destinationsError ? (
              <View style={styles.inlineErrorBlock}>
                <AppText variant="caption" color="error">
                  {destinationsError}
                </AppText>
                <AppButton label="Retry" variant="secondary" onPress={() => void reloadDestinations()} />
              </View>
            ) : null}

            <AppInput tone="surface"
              label="Weight (kg)"
              value={form.weight}
              onChangeText={(text) => updateField('weight', text)}
              keyboardType="decimal-pad"
            />

            <AppText variant="label">Dimensions (cm)</AppText>
            <View style={styles.dimensionRow}>
              <AppInput tone="surface"
                label="L"
                value={form.length}
                onChangeText={(text) => updateField('length', text)}
                keyboardType="decimal-pad"
                containerStyle={styles.dimensionField}
              />
              <AppText variant="bodyMedium" color="textSecondary" style={styles.dimensionSeparator}>
                ×
              </AppText>
              <AppInput tone="surface"
                label="W"
                value={form.width}
                onChangeText={(text) => updateField('width', text)}
                keyboardType="decimal-pad"
                containerStyle={styles.dimensionField}
              />
              <AppText variant="bodyMedium" color="textSecondary" style={styles.dimensionSeparator}>
                ×
              </AppText>
              <AppInput tone="surface"
                label="H"
                value={form.height}
                onChangeText={(text) => updateField('height', text)}
                keyboardType="decimal-pad"
                containerStyle={styles.dimensionField}
              />
            </View>

            <AppInput tone="surface"
              label="Quantity"
              value={form.quantity}
              onChangeText={(text) => updateField('quantity', text)}
              keyboardType="number-pad"
            />

            <AppInput tone="surface"
              label="Dispatch days"
              value={form.dispatchDays}
              onChangeText={(text) => updateField('dispatchDays', text)}
              keyboardType="number-pad"
            />

            <AppButton
              label={isFetchingEstimate ? 'Fetching estimate...' : 'Get estimate'}
              loading={isFetchingEstimate}
              onPress={() => void fetchEstimate(form)}
            />

            {isFetchingEstimate ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="bodySmall" color="textSecondary">
                  Loading estimate...
                </AppText>
              </View>
            ) : null}

            {estimateError ? (
              <AppText variant="caption" color="error">
                {estimateError}
              </AppText>
            ) : null}

            {dhlEstimate || freightComEstimate ? (
              <View style={styles.resultsSection}>
                <AppText variant="bodyMedium" style={styles.resultsTitle}>
                  Estimated shipping
                </AppText>
                <EstimateResultCard
                  title="DHL"
                  amount={formatEstimateAmount(dhlEstimate)}
                  error={formatEstimateError(dhlEstimate)}
                  serviceName={dhlEstimate?.serviceName}
                />
                <EstimateResultCard
                  title={freightComEstimate?.carrierName?.trim() || 'Freightcom'}
                  amount={formatEstimateAmount(freightComEstimate)}
                  error={formatEstimateError(freightComEstimate)}
                  serviceName={freightComEstimate?.serviceName}
                />
              </View>
            ) : null}
          </ScrollView>

          <AppButton label="Close" variant="secondary" onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
  },
  copy: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  scroll: {
    maxHeight: 520,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  dimensionField: {
    flex: 1,
  },
  dimensionSeparator: {
    marginBottom: spacing.md,
  },
  inlineErrorBlock: {
    gap: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultsSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  resultsTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  resultCard: {
    gap: spacing.xs,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultAmount: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
