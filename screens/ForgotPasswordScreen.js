import { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useLanguage } from '../i18n';
import AuthLayout, { authStyles as s } from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PressableScale from '../components/PressableScale';

// Firebase language codes for the reset email, keyed by app language.
const EMAIL_LANGUAGES = { en: 'en', zh: 'zh-CN' };

export default function ForgotPasswordScreen({ navigation, route }) {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const address = email.trim();
    if (!address) { Alert.alert(t('common.error'), t('common.fillAllFields')); return; }
    setLoading(true);
    auth.languageCode = EMAIL_LANGUAGES[lang] || 'en';
    try {
      await sendPasswordResetEmail(auth, address);
      setSent(true);
    } catch (error) {
      // Same message whether or not the account exists, so the screen
      // can't be used to check who has signed up.
      if (error.code === 'auth/user-not-found') { setSent(true); return; }
      let msg = t('common.tryAgain');
      if (error.code === 'auth/invalid-email') msg = t('auth.invalidEmail');
      else if (error.code === 'auth/too-many-requests') msg = t('auth.tooManyRequests');
      else if (error.code === 'auth/network-request-failed') msg = t('auth.networkError');
      Alert.alert(t('auth.resetFailed'), msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        navigation={navigation}
        emoji="📬"
        badgeColor={Colors.playMint}
        title={t('auth.resetSentTitle')}
        subtitle={t('auth.resetSentBody', { email: email.trim() })}
      >
        <PressableScale style={s.button} onPress={() => navigation.goBack()}>
          <Text style={s.buttonText}>{t('auth.backToLogin')}</Text>
        </PressableScale>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      navigation={navigation}
      emoji="🔑"
      badgeColor={Colors.playPeach}
      title={t('auth.resetTitle')}
      subtitle={t('auth.resetSub')}
    >
      <View style={s.form}>
        <AuthInput
          label={t('auth.email')}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoFocus={!email}
        />
        <PressableScale
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={s.buttonText}>{loading ? t('auth.sendingResetLink') : t('auth.sendResetLink')}</Text>
        </PressableScale>
      </View>
    </AuthLayout>
  );
}
