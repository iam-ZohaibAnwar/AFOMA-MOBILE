import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../design-system';

export function OtpVerificationHeroIcon() {
  return (
    <View style={styles.outerRing}>
      <View style={styles.innerRing}>
        <Text style={styles.envelopeIcon}>✉</Text>
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeIcon: {
    fontSize: 34,
    color: colors.textInverse,
    lineHeight: 38,
  },
  lockBadge: {
    position: 'absolute',
    right: 14,
    bottom: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 11,
    lineHeight: 14,
  },
});
