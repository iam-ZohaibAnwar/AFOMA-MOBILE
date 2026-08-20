import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

interface PlaceholderAction {
  label: string;
  onPress: () => void;
}

interface PlaceholderScreenProps {
  title: string;
  subtitle?: string;
  params?: Record<string, string | undefined>;
  actions?: PlaceholderAction[];
  footer?: ReactNode;
}

export function PlaceholderScreen({
  title,
  subtitle,
  params,
  actions = [],
  footer,
}: PlaceholderScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {params && Object.keys(params).length > 0 ? (
        <View style={styles.paramsBox}>
          <Text style={styles.paramsTitle}>Route params</Text>
          {Object.entries(params).map(([key, value]) => (
            <Text key={key} style={styles.paramLine}>
              {key}: {value ?? '—'}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable key={action.label} style={styles.button} onPress={action.onPress}>
            <Text style={styles.buttonText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FFF7ED',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 22,
  },
  paramsBox: {
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  paramsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172554',
    marginBottom: 8,
  },
  paramLine: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
