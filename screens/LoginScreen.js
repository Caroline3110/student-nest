import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { LanguageToggle } from '../components/FormField';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert(t('common.error'), t('common.fillAllFields')); return; }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      let msg = t('auth.loginFailedGeneric');
      if (error.code === 'auth/invalid-email') msg = t('auth.invalidEmail');
      else if (error.code === 'auth/user-not-found') msg = t('auth.userNotFound');
      else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = t('auth.wrongPassword');
      Alert.alert(t('auth.loginFailed'), msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.langRow, { paddingTop: insets.top + 12 }]}>
          <LanguageToggle />
        </View>
        <View style={[styles.hero, { paddingTop: 24 }]}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>Student Nest</Text>
          <Text style={styles.heroTagline}>{t('auth.tagline')}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>
          <Text style={styles.subheading}>{t('auth.signInSub')}</Text>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>{t('auth.email')}</Text>
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
              <Text style={styles.inputLabel}>{t('auth.password')}</Text>
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
              <Text style={styles.buttonText}>{loading ? t('auth.signingIn') : t('auth.signIn')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.linkBtn}>
            <Text style={styles.linkText}>
              {t('auth.noAccount')}{'  '}
              <Text style={styles.linkBold}>{t('auth.createOne')}</Text>
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
  langRow: { paddingHorizontal: 24 },
  hero: {
    backgroundColor: Colors.background,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
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
    minHeight: 480,
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
