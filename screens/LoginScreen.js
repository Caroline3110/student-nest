import { useEffect, useState } from 'react';
import { Text, View, Alert, StyleSheet, Platform } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import AuthLayout, { authStyles as s } from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import { MailIcon, LockIcon } from '../components/AuthIcons';
import PressableScale from '../components/PressableScale';

export default function LoginScreen({ navigation, route }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Filled in when Signup sends someone here because the email already has an account.
  useEffect(() => {
    if (route.params?.email) setEmail(route.params.email);
  }, [route.params?.email]);

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

  // Google and Apple sign-in aren't built yet; the buttons show what's coming.
  const comingSoon = () => Alert.alert(t('auth.comingSoon'), t('auth.socialComingSoon'));

  return (
    <AuthLayout
      navigation={navigation}
      showTopRow={false}
      hero={(
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>☕</Text>
          <Text style={styles.heart}>{'♥︎'}</Text>
        </View>
      )}
      title={t('auth.welcomeBack')}
      subtitle={`${t('auth.goodToSeeYou')}\n${t('auth.uniEasier')}`}
    >
      <View style={s.form}>
        <AuthInput
          icon={<MailIcon />}
          placeholder={t('auth.emailAddress')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <AuthInput
          icon={<LockIcon />}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        <PressableScale
          style={styles.forgot}
          scaleTo={0.97}
          hitSlop={8}
          onPress={() => navigation.navigate('ForgotPassword', { email: email.trim() })}
        >
          <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
        </PressableScale>
        <PressableScale
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={s.buttonText}>{loading ? t('auth.signingIn') : t('auth.signIn')}</Text>
        </PressableScale>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <PressableScale style={styles.socialBtn} onPress={comingSoon} accessibilityLabel="Google">
          <Text style={styles.google}>G</Text>
        </PressableScale>
        {/* The Apple logo character only exists in Apple's fonts. */}
        {Platform.OS === 'ios' && (
          <PressableScale style={styles.socialBtn} onPress={comingSoon} accessibilityLabel="Apple">
            <Text style={styles.apple}>{''}</Text>
          </PressableScale>
        )}
        <PressableScale
          style={styles.socialBtn}
          onPress={() => navigation.navigate('Signup')}
          accessibilityLabel={t('auth.email')}
        >
          <MailIcon color={Colors.brandDeep} size={22} />
        </PressableScale>
      </View>

      <PressableScale style={s.link} scaleTo={0.97} onPress={() => navigation.navigate('Signup')}>
        <Text style={s.linkText}>
          {t('auth.noAccount')}{'  '}
          <Text style={s.linkBold}>{t('auth.signUp')}</Text>
        </Text>
      </PressableScale>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  // Stand-in for the coffee illustration until the artwork is added.
  illustration: {
    alignSelf: 'center',
    width: 168,
    height: 168,
    borderRadius: 84,
    backgroundColor: Colors.blush,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationEmoji: { fontSize: 72 },
  heart: { position: 'absolute', top: 30, right: 30, fontSize: 22, color: Colors.brandDeep },

  forgot: { alignSelf: 'flex-end', marginTop: -2, paddingVertical: 2, paddingHorizontal: 4 },
  forgotText: { fontSize: 13.5, fontWeight: '700', color: Colors.brandDeep },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 26 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.creamBorder },
  dividerText: { fontSize: 13, color: Colors.warmGrey },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 18 },
  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  google: { fontSize: 24, fontWeight: '800', color: '#4285F4' },
  apple: { fontSize: 26, color: '#000000', marginTop: -2 },
});
