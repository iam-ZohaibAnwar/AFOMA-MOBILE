import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '../../../components/ui/AppCard';
import { SellerSetupProgress } from '../../seller/components/SellerSetupProgress';
import {
  isSellerProductCreationAllowed,
} from '../../seller/utils/sellerSetupSections';
import type { SellerProfileSetup } from '../../seller/types/sellerProfile';

export interface AccountSellerSetupCardProps {
  profileSetup?: SellerProfileSetup;
  onContinueSetup: () => void;
}

export function AccountSellerSetupCard({
  profileSetup,
  onContinueSetup,
}: AccountSellerSetupCardProps) {
  const isComplete = isSellerProductCreationAllowed(profileSetup);

  if (isComplete) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue seller setup"
        onPress={onContinueSetup}
      >
        <AppCard variant="flat">
          <SellerSetupProgress
            profileSetup={profileSetup}
            onContinue={onContinueSetup}
            title="Finish setting up your shop"
            subtitle="Complete the remaining steps to start selling."
            continueLabel="Continue setup →"
          />
        </AppCard>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
});
