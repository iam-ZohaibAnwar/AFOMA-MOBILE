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
import { colors, spacing } from '../../../design-system';
import { AuthFooterTabBar, type AuthFooterTabName } from './AuthFooterTabBar';
import { useAuthFooterTabBarInset } from './authFooterTabBarLayout';

export interface AuthFlowScreenProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backAccessibilityLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  activeFooterTab?: AuthFooterTabName;
}

export function AuthFlowScreen({
  title,
  subtitle,
  onBack,
  backAccessibilityLabel = 'Go back',
  children,
  footer,
  activeFooterTab = 'account',
}: AuthFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const footerTabBarInset = useAuthFooterTabBarInset();

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
              paddingBottom: footerTabBarInset + spacing.lg,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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

      <AuthFooterTabBar activeTab={activeFooterTab} />
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
