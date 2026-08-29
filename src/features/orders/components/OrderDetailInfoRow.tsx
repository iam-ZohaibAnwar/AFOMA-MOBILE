import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../../../components/ui/AppText';
import { colors, spacing } from '../../../design-system';

interface OrderDetailInfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  onCopy?: () => void;
}

export function OrderDetailInfoRow({
  label,
  value,
  valueColor = colors.textPrimary,
  onCopy,
}: OrderDetailInfoRowProps) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color="textMuted" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="bodyMedium" style={[styles.value, { color: valueColor }]} numberOfLines={2}>
          {value}
        </AppText>
        {onCopy ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Copy ${label}`}
            onPress={onCopy}
            hitSlop={8}
            style={({ pressed }) => [styles.copyButton, pressed && styles.copyButtonPressed]}
          >
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
    fontWeight: '600',
  },
  copyButton: {
    padding: spacing.xs,
  },
  copyButtonPressed: {
    opacity: 0.85,
  },
});
