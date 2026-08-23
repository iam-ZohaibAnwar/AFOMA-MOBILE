import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../../../components/ecommerce/ErrorState';
import { AppCard } from '../../../components/ui/AppCard';
import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';
import type { SellerStackParamList } from '../../../app/navigation/sellerTypes';
import { authReturnTo } from '../../auth/utils/authNavigation';
import { SellerSetupSectionRow } from '../components/SellerSetupSectionRow';
import { useRequireSeller } from '../hooks/useRequireSeller';
import { useSellerProfile } from '../hooks/useSellerProfile';
import { SELLER_PERSONAL_PROFILE_SECTIONS } from '../utils/sellerProfileSections';

type Props = NativeStackScreenProps<SellerStackParamList, 'SellerPersonalInformation'>;

const RETURN_TO = authReturnTo.sellerPersonalInformation();

export function SellerPersonalInformationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthorized, sellerId } = useRequireSeller(RETURN_TO);
  const { profile, isLoading, error, reload } = useSellerProfile(isAuthorized ? sellerId : undefined);

  if (!isAuthorized) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLoading && !profile) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      showsVerticalScrollIndicator={false}
    >
      <AppCard variant="muted">
        <AppText variant="bodyMedium" style={styles.title}>
          Personal information
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" style={styles.copy}>
          Update your personal contact details and business address.
        </AppText>
      </AppCard>

      {error ? <ErrorState message={error} onAction={() => void reload()} style={styles.error} /> : null}

      <AppCard variant="flat">
        {SELLER_PERSONAL_PROFILE_SECTIONS.map((section) => (
          <SellerSetupSectionRow
            key={section.id}
            section={section}
            profileSetup={profile?.profileSetup}
            profile={profile}
            mode="profile"
            onPress={() => navigation.navigate('SellerSetupSection', { section: section.id })}
          />
        ))}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  copy: { lineHeight: 20 },
  error: { alignSelf: 'stretch', marginHorizontal: 0 },
});
