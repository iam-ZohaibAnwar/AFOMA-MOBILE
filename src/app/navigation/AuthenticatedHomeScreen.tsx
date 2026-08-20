import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '../../features/auth/components/AuthForm';
import { useAuth } from '../../features/auth/hooks/useAuth';

export function AuthenticatedHomeScreen() {
  const { user, role, fullAccess, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signed in</Text>
      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{user?.email ?? '—'}</Text>
      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{role ?? 'Unknown role'}</Text>
      {role === 'admin' ? (
        <>
          <Text style={styles.label}>Full access</Text>
          <Text style={styles.value}>{fullAccess ? 'Yes' : 'No'}</Text>
        </>
      ) : null}
      <View style={styles.buttonWrap}>
        <AuthButton label="Log out" onPress={() => void logout()} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 12,
  },
  value: {
    fontSize: 17,
    color: '#172554',
    fontWeight: '600',
  },
  buttonWrap: {
    marginTop: 32,
  },
});
