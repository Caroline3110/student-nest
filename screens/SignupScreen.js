import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) { Alert.alert('Error', 'Please fill in all fields'); return; }
    if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
    if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      let msg = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered';
      else if (error.code === 'auth/invalid-email') msg = 'Invalid email address';
      else if (error.code === 'auth/weak-password') msg = 'Password is too weak';
      Alert.alert('Signup failed', msg);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkText}>Student Nest</Text>
        </View>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.subheading}>Sign up to get started</Text>

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
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
          <Text style={styles.linkText}>
            Already have an account?{'  '}
            <Text style={styles.linkBold}>Sign in</Text>
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