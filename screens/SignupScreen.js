import { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import AuthLayout, { authStyles as s } from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PressableScale from '../components/PressableScale';

export default function SignupScreen({ navigation }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) { Alert.alert(t('common.error'), t('common.fillAllFields')); return; }
    if (password !== confirmPassword) { Alert.alert(t('common.error'), t('auth.passwordsDontMatch')); return; }
    if (password.length < 6) { Alert.alert(t('common.error'), t('auth.passwordTooShort')); return; }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      let msg = t('auth.signupFailedGeneric');
      if (error.code === 'auth/email-already-in-use') msg = t('auth.emailInUse');
      else if (error.code === 'auth/invalid-email') msg = t('auth.invalidEmail');
      else if (error.code === 'auth/weak-password') msg = t('auth.weakPassword');
      Alert.alert(t('auth.signupFailed'), msg);
    }
  };


  return (
    <AuthLayout
      navigation={navigation}
      emoji="🎉"
      badgeColor={Colors.playLilac}
      title={t('auth.createAccount')}
      subtitle={t('auth.joinTagline')}
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
        />
        <AuthInput
          label={t('auth.password')}
          placeholder={t('auth.passwordHint')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AuthInput
          label={t('auth.confirmPassword')}
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <PressableScale
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={s.buttonText}>{loading ? t('auth.creatingAccount') : t('auth.createAccount')}</Text>
        </PressableScale>
      </View>

      <PressableScale style={s.link} scaleTo={0.97} onPress={() => navigation.navigate('Login')}>
        <Text style={s.linkText}>
          {t('auth.haveAccount')}{'  '}
          <Text style={s.linkBold}>{t('auth.signIn')}</Text>
        </Text>
      </PressableScale>
    </AuthLayout>
  );
}
