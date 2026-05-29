import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      let msg = 'Login failed. Please try again.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
      else if (error.code === 'auth/user-not-found') msg = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') msg = 'Incorrect password';
      Alert.alert('Login failed', msg);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkText}>Student Nest</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to your account</Text>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkBtn}>
          <Text style={styles.linkText}>
            No account?{'  '}
            <Text style={styles.linkBold}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  wordmark: { marginBottom: 48 },
  wordmarkText: {
    fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3,
  },
  heading: {
    fontSize: 28, fontWeight: '700', color: Colors.textPrimary,
    letterSpacing: -0.5, marginBottom: 6,
  },
  subheading: { fontSize: 14, color: Colors.textLight, marginBottom: 32 },
  form: { gap: 14 },
  inputWrap: { gap: 6 },
  inputLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  linkBtn: { marginTop: 28, alignItems: 'center' },
  linkText: { fontSize: 13, color: Colors.textLight },
  linkBold: { color: Colors.textPrimary, fontWeight: '600' },
});