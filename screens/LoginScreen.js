import { useState } from 'react';
import { Text, View, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import AuthLayout, { authStyles as s } from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import PressableScale from '../components/PressableScale';

export default function LoginScreen({ navigation }) {
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
    <AuthLayout
      navigation={navigation}
      emoji="👋"
      badgeColor={Colors.playYellow}
      title={t('auth.welcomeBack')}
      subtitle={t('auth.signInSub')}
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
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        <PressableScale
          style={[s.button, loading && s.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={s.buttonText}>{loading ? t('auth.signingIn') : t('auth.signIn')}</Text>
        </PressableScale>
      </View>

      <PressableScale style={s.link} scaleTo={0.97} onPress={() => navigation.navigate('Signup')}>
        <Text style={s.linkText}>
          {t('auth.noAccount')}{'  '}
          <Text style={s.linkBold}>{t('auth.createOne')}</Text>
        </Text>
      </PressableScale>
    </AuthLayout>
  );
}
