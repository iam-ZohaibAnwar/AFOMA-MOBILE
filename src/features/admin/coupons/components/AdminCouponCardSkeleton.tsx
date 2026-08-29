import { StyleSheet, View } from 'react-native';



import { Skeleton } from '../../../../components/ecommerce';

import { colors, radius, shadows, spacing } from '../../../../design-system';



export function AdminCouponCardSkeleton() {

  return (

    <View style={styles.card}>

      <View style={styles.headerRow}>

        <Skeleton variant="circle" width={44} height={44} />

        <View style={styles.content}>

          <Skeleton variant="text" height={16} width="58%" />

          <Skeleton variant="text" height={12} width="42%" />

          <Skeleton variant="rect" width={88} height={22} style={styles.badge} />

          <View style={styles.footerRow}>

            <View style={styles.metaSkeletons}>

              <Skeleton variant="text" height={12} width="78%" />

              <Skeleton variant="text" height={12} width="56%" />

            </View>

            <Skeleton variant="text" height={28} width="22%" />

          </View>

        </View>

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  card: {

    backgroundColor: colors.surface,

    borderRadius: radius.large,

    borderWidth: 1,

    borderColor: colors.border,

    padding: spacing.lg,

    ...shadows.card,

  },

  headerRow: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: spacing.md,

  },

  content: {

    flex: 1,

    gap: spacing.sm,

  },

  badge: {

    borderRadius: radius.pill,

  },

  footerRow: {

    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent: 'space-between',

    gap: spacing.md,

    marginTop: spacing.sm,

  },

  metaSkeletons: {

    flex: 1,

    gap: spacing.xs,

  },

});


