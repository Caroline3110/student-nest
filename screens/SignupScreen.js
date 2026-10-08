import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';

export default function SignupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>Student Nest</Text>
          <Text style={styles.heroTagline}>Join thousands of students.</Text>
        </View>

        <View style={styles.formSection}>
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

          <View style={{ height: Math.max(insets.bottom + 16, 40) }} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    backgroundColor: Colors.background,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  heroTagline: {
    fontSize: 15,
    color: Colors.textLight,
    fontWeight: '400',
  },
  formSection: {
    backgroundColor: Colors.background,
    paddingHorizontal: 28,
    paddingTop: 16,
    minHeight: 520,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 28,
  },
  form: { gap: 14 },
  inputWrap: { gap: 6 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 13, color: Colors.textLight },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
