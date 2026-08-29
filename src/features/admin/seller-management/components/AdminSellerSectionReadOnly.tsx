import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminEditableSellerSectionId, AdminSellerListItem } from '../types/adminSellerManagement';
import type {
  AdminSellerAddressFormValues,
  AdminSellerPaymentFormValues,
  AdminSellerPoliciesFormValues,
  AdminSellerShopDetailsFormValues,
} from '../types/adminSellerSections';
import {
  adminSectionFormFromSeller,
  formatAdminBoolean,
  formatAdminField,
} from '../utils/adminSellerSectionForms';

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyMedium">{value}</AppText>
    </View>
  );
}

function ReadOnlyImage({ label, uri }: { label: string; uri?: string }) {
  if (!uri?.trim()) {
    return <ReadOnlyField label={label} value="—" />;
  }

  return (
    <View style={styles.field}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <Image source={{ uri: uri.trim() }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

export interface AdminSellerSectionReadOnlyProps {
  sectionId: AdminEditableSellerSectionId;
  seller: AdminSellerListItem;
}

export function AdminSellerSectionReadOnly({ sectionId, seller }: AdminSellerSectionReadOnlyProps) {
  switch (sectionId) {
    case 'address': {
      const form = adminSectionFormFromSeller('address', seller) as AdminSellerAddressFormValues;
      return (
        <View style={styles.container}>
          <ReadOnlyField label="Country" value={formatAdminField(form.country)} />
          <ReadOnlyField label="State / province" value={formatAdminField(form.state)} />
          <ReadOnlyField label="City" value={formatAdminField(form.city)} />
          <ReadOnlyField label="Zip / postal code" value={formatAdminField(form.zipCode)} />
          <ReadOnlyField label="Street address" value={formatAdminField(form.streetAddress)} />
        </View>
      );
    }
    case 'shop-details': {
      const form = adminSectionFormFromSeller('shop-details', seller) as AdminSellerShopDetailsFormValues;
      return (
        <View style={styles.container}>
          <ReadOnlyImage label="Profile image" uri={form.userProfile} />
          <ReadOnlyImage label="Store banner" uri={form.storeBanner} />
          <ReadOnlyImage label="Store logo" uri={form.storeLogo} />
          <ReadOnlyField label="Shop title" value={formatAdminField(form.storeTitle)} />
          <ReadOnlyField label="Shop description" value={formatAdminField(form.storeDesc)} />
          <ReadOnlyField label="Twitter" value={formatAdminField(form.twitter)} />
          <ReadOnlyField label="Facebook" value={formatAdminField(form.facebook)} />
          <ReadOnlyField label="Instagram" value={formatAdminField(form.instagram)} />
          <ReadOnlyField label="Tax / VAT number" value={formatAdminField(form.taxVatNumber)} />
          <ReadOnlyField label="Product gallery URL" value={formatAdminField(form.productGallery)} />
        </View>
      );
    }
    case 'payment-information': {
      const form = adminSectionFormFromSeller('payment-information', seller) as AdminSellerPaymentFormValues;
      return (
        <View style={styles.container}>
          <ReadOnlyField label="Account holder name" value={formatAdminField(form.accountHolderName)} />
          <ReadOnlyField label="Account number" value={formatAdminField(form.accountNumber)} />
          <ReadOnlyField label="Bank name" value={formatAdminField(form.bankName)} />
          <ReadOnlyField label="SWIFT code" value={formatAdminField(form.swiftCode)} />
          <ReadOnlyField label="IBAN" value={formatAdminField(form.ibanNumber)} />
        </View>
      );
    }
    case 'shop-policies': {
      const form = adminSectionFormFromSeller('shop-policies', seller) as AdminSellerPoliciesFormValues;
      return (
        <View style={styles.container}>
          <ReadOnlyField
            label="Cancellation policy"
            value={formatAdminBoolean(form.cancellationPolicy)}
          />
          {form.cancellationPolicy ? (
            <ReadOnlyField
              label="Cancellation window"
              value={form.cancellationPolicyTime ? `${form.cancellationPolicyTime} hours` : '—'}
            />
          ) : null}
          <ReadOnlyField label="Return policy" value={formatAdminBoolean(form.returnPolicy)} />
          {form.returnPolicy ? (
            <ReadOnlyField label="Return policy details" value={formatAdminField(form.returnPolicyDetails)} />
          ) : null}
          {form.faqList.length > 0 ? (
            <View style={styles.faqBlock}>
              <AppText variant="label">FAQs</AppText>
              {form.faqList.map((faq, index) => (
                <View key={`${faq.question}-${index}`} style={styles.faqItem}>
                  <AppText variant="bodyMedium">{faq.question}</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {faq.answer}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <ReadOnlyField label="FAQs" value="—" />
          )}
        </View>
      );
    }
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceMuted,
  },
  faqBlock: {
    gap: spacing.sm,
  },
  faqItem: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
