import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../../../components/ui/AppButton';
import { AppInput } from '../../../../components/ui/AppInput';
import { AppText } from '../../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../../design-system';
import type { AdminShippingMatrixMap, AdminShippingTierDraft } from '../types/adminShippingConfig';

export interface AdminShippingMatrixModalProps {
  visible: boolean;
  originTierName: string | null;
  tiers: AdminShippingTierDraft[];
  matrix: AdminShippingMatrixMap;
  onDismiss: () => void;
  onChangeCell: (fromTier: string, toTier: string, value: string) => void;
}

export function AdminShippingMatrixModal({
  visible,
  originTierName,
  tiers,
  matrix,
  onDismiss,
  onChangeCell,
}: AdminShippingMatrixModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  if (!originTierName) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable accessibilityRole="button" style={styles.backdrop} onPress={onDismiss} />
        <View
          style={[
            styles.sheet,
            {
              maxHeight: Math.round(windowHeight * 0.82),
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            Shipping cost matrix
          </AppText>
          <AppText variant="caption" color="textSecondary">
            Origin: {originTierName}. Tap Save All on the main screen to persist changes.
          </AppText>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
            {tiers.map((destination) => (
              <View key={destination.tierName} style={styles.row}>
                <View style={styles.rowCopy}>
                  <AppText variant="bodyMedium" style={styles.destination}>
                    → {destination.tierName}
                  </AppText>
                </View>
                <AppInput
                  label="Surcharge"
                  tone="surface"
                  value={matrix[originTierName]?.[destination.tierName] ?? '0'}
                  onChangeText={(value) => onChangeCell(originTierName, destination.tierName, value)}
                  keyboardType="decimal-pad"
                  containerStyle={styles.inputWrap}
                />
              </View>
            ))}
          </ScrollView>

          <AppButton label="Done" onPress={onDismiss} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.large,
    borderTopRightRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  title: {
    color: colors.textPrimary,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.small,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  rowCopy: {
    gap: spacing.xs,
  },
  destination: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  inputWrap: {
    marginBottom: 0,
  },
});
