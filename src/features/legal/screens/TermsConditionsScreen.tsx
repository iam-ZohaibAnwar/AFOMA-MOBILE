import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../../../components/ecommerce/EmptyState';
import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { ShoppingStackParamList } from '../../../app/navigation/types';
import { useRequireAuth } from '../../auth/hooks/useRequireAuth';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { LegalContentWebView } from '../components/LegalContentWebView';
import { useTermsConditions } from '../hooks/useTermsConditions';

type Props = NativeStackScreenProps<ShoppingStackParamList, 'TermsConditions'>;

const TERMS_RETURN_TO = authReturnTo.termsConditions();

export function TermsConditionsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized } = useRequireAuth(TERMS_RETURN_TO);
  const { htmlContent, isLoading, error, reload } = useTermsConditions();

  if (!isAuthorized) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !htmlContent) {
    return (
      <View style={[styles.centeredState, { paddingBottom: insets.bottom }]}>
        <ErrorState message={error} onAction={() => void reload()} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <AppText variant="h3" style={styles.title}>
          AFOMA Marketplace Seller Terms and Conditions
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Global marketplace legal agreement. This is separate from your shop policies and FAQs.
        </AppText>
      </View>

      {isLoading && !htmlContent ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}

      {!htmlContent && !isLoading ? (
        <EmptyState
          title="No content available"
          message="Terms & Conditions could not be loaded."
          actionLabel="Try again"
          onAction={() => void reload()}
        />
      ) : null}

      {htmlContent ? (
        <View style={styles.content}>
          {error ? (
            <AppText variant="bodySmall" color="error" style={styles.inlineError}>
              {error}
            </AppText>
          ) : null}
          <LegalContentWebView htmlContent={htmlContent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inlineError: {
    marginBottom: spacing.sm,
  },
});
