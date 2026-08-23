import { StyleSheet, View } from 'react-native';

import { colors } from '../../../design-system';

export function OrderSuccessHeroArt() {
  return (
    <View style={styles.wrap}>
      <View style={styles.outerRing}>
        <View style={styles.innerCircle}>
          <View style={styles.person}>
            <View style={styles.head} />
            <View style={styles.body} />
            <View style={styles.backpack} />
            <View style={styles.legs}>
              <View style={styles.leg} />
              <View style={styles.leg} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  outerRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#E8F2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  person: {
    width: 72,
    height: 88,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  head: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FDBA74',
    marginBottom: 2,
  },
  body: {
    width: 28,
    height: 34,
    borderRadius: 14,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 24,
  },
  backpack: {
    width: 18,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    position: 'absolute',
    top: 28,
    right: 10,
  },
  legs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 56,
  },
  leg: {
    width: 10,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#172554',
  },
});
