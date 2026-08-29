import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, spacing } from '../../../../design-system';
import {
  AFOMA_DOMESTIC_SHIPPING_COUNTRIES,
  type ShippingRegionFormState,
  type ShippingScope,
} from '../types/sellerShipping';
import {
  applyInternationalAfomaExclusivity,
  applyInternationalSellerManagedToggle,
  getFlatRateSummary,
  getHandDeliverySummary,
} from '../utils/sellerShippingMappers';
import { FlatRateSheet } from './FlatRateSheet';
import { HandDeliverySheet } from './HandDeliverySheet';
import { ShippingMethodRow } from './ShippingMethodRow';

export interface ShippingRegionSectionProps {
  title: string;
  scope: ShippingScope;
  currency: string;
  countryCode?: string;
  region: ShippingRegionFormState;
  onChange: (region: ShippingRegionFormState) => void;
}

export function ShippingRegionSection({
  title,
  scope,
  currency,
  countryCode,
  region,
  onChange,
}: ShippingRegionSectionProps) {
  const [flatRateVisible, setFlatRateVisible] = useState(false);
  const [handDeliveryVisible, setHandDeliveryVisible] = useState(false);

  const normalizedCountry = countryCode?.trim().toUpperCase();
  const afomaDomesticAllowed =
    scope === 'domestic'
      ? !normalizedCountry ||
        (AFOMA_DOMESTIC_SHIPPING_COUNTRIES as readonly string[]).includes(normalizedCountry)
      : true;
  const internationalAfomaActive = scope === 'international' && region.afoma_shipping;
  const sellerManagedDisabled = scope === 'international' && region.afoma_shipping;

  const flatRateSummary = region.flat_rate
    ? getFlatRateSummary(region.flat_rate_options, currency)
    : 'Off';
  const handDeliverySummary = region.hand_delivery
    ? getHandDeliverySummary(region.hand_delivery_options, currency)
    : 'Off';

  return (
    <View style={styles.section}>
      <AppText variant="bodyMedium" style={styles.sectionTitle}>
        {title}
      </AppText>
      <View style={styles.divider} />

      <ShippingMethodRow
        icon="car-outline"
        label="AFOMA Shipping"
        subtitle={
          scope === 'domestic'
            ? afomaDomesticAllowed
              ? 'Available for CA / US sellers'
              : 'Available for CA / US sellers only'
            : 'Platform-managed international shipping'
        }
        mode="toggle"
        enabled={region.afoma_shipping}
        disabled={scope === 'domestic' ? !afomaDomesticAllowed : false}
        onToggle={(enabled) => {
          if (scope === 'international') {
            onChange(applyInternationalAfomaExclusivity(region, enabled));
            return;
          }

          onChange({ ...region, afoma_shipping: enabled });
        }}
      />

      <ShippingMethodRow
        icon="cube-outline"
        label="Flat Rate"
        mode="navigate"
        valueLabel={flatRateSummary}
        disabled={sellerManagedDisabled}
        onPress={() => setFlatRateVisible(true)}
      />

      <ShippingMethodRow
        icon="hand-left-outline"
        label="Hand Delivery"
        mode="navigate"
        valueLabel={handDeliverySummary}
        disabled={sellerManagedDisabled}
        onPress={() => setHandDeliveryVisible(true)}
        showDivider={false}
      />

      {internationalAfomaActive ? (
        <AppText variant="caption" color="textSecondary" style={styles.hint}>
          International AFOMA Shipping replaces seller-managed flat rate and hand delivery.
        </AppText>
      ) : null}

      <FlatRateSheet
        visible={flatRateVisible}
        currency={currency}
        value={region.flat_rate_options}
        onClose={() => setFlatRateVisible(false)}
        onSave={(flatRateOptions, enabled) => {
          const next = applyInternationalSellerManagedToggle(region, {
            flat_rate: enabled,
            flat_rate_options: flatRateOptions,
          });
          onChange(next);
        }}
      />

      <HandDeliverySheet
        visible={handDeliveryVisible}
        currency={currency}
        value={region.hand_delivery_options}
        onClose={() => setHandDeliveryVisible(false)}
        onSave={(handDeliveryOptions, enabled) => {
          const next = applyInternationalSellerManagedToggle(region, {
            hand_delivery: enabled,
            hand_delivery_options: handDeliveryOptions,
          });
          onChange(next);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  hint: {
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});
