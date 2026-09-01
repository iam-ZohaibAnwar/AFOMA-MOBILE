import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, radius, spacing } from '../../../design-system';

type StepId = 'cart' | 'payment';

interface CheckoutStepIndicatorProps {
  currentStep: StepId;
}

const STEPS: { id: StepId; label: string }[] = [
  { id: 'cart', label: 'Cart & delivery' },
  { id: 'payment', label: 'Payment' },
];

function stepIndex(step: StepId): number {
  return STEPS.findIndex((entry) => entry.id === step);
}

export function CheckoutStepIndicator({ currentStep }: CheckoutStepIndicatorProps) {
  const currentIndex = stepIndex(currentStep);

  return (
    <View style={styles.row}>
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <View key={step.id} style={styles.stepWrap}>
            <View style={styles.stepTop}>
              {index > 0 ? (
                <View
                  style={[
                    styles.connector,
                    isComplete && styles.connectorActive,
                  ]}
                />
              ) : null}

              <View
                style={[
                  styles.circle,
                  isComplete && styles.circleComplete,
                  isCurrent && styles.circleCurrent,
                  isUpcoming && styles.circleUpcoming,
                ]}
              >
                {isComplete ? (
                  <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                ) : (
                  <AppText
                    variant="caption"
                    style={[
                      styles.circleText,
                      isCurrent && styles.circleTextCurrent,
                      isUpcoming && styles.circleTextUpcoming,
                    ]}
                  >
                    {index + 1}
                  </AppText>
                )}
              </View>

              {index < STEPS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    isComplete && styles.connectorActive,
                  ]}
                />
              ) : null}
            </View>

            <AppText
              variant="caption"
              style={[
                styles.label,
                isCurrent && styles.labelCurrent,
                isUpcoming && styles.labelUpcoming,
              ]}
              numberOfLines={2}
            >
              {step.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderStrong,
    marginHorizontal: spacing.xs,
  },
  connectorActive: {
    backgroundColor: colors.primary,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  circleComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleCurrent: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  circleUpcoming: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  circleText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  circleTextCurrent: {
    color: colors.primary,
  },
  circleTextUpcoming: {
    color: colors.textMuted,
  },
  label: {
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  labelUpcoming: {
    color: colors.textMuted,
  },
});
