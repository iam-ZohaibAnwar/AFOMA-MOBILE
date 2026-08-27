import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/ui/AppText';
import { HeaderBackButton } from '../../../components/ui/HeaderBackButton';
import {
  marketplaceScrollProps,
  useMarketplaceFooterContentInset,
  useMarketplaceScrollHandler,
} from '../../../app/navigation/marketplaceChrome';
import { colors, spacing } from '../../../design-system';

export interface AuthFlowScreenProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFlowScreen({
  title,
  subtitle,
  onBack,
  backAccessibilityLabel = 'Go back',
  children,
  footer,
}: AuthFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const footerInset = useMarketplaceFooterContentInset();
  const onMarketplaceScroll = useMarketplaceScrollHandler();

  return (
    <View style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing.lg,
              paddingBottom: footerInset + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={onMarketplaceScroll}
          {...marketplaceScrollProps}
        >
          <View style={styles.topBar}>
            <HeaderBackButton onPress={onBack} accessibilityLabel={backAccessibilityLabel} />
          </View>

          <AppText variant="h1" style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="body" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}

          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  body: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});
