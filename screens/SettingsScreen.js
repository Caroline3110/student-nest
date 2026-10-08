import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Colors from '../constants/Colors';
import { LANGUAGES, useLanguage } from '../i18n';
import { useProfile, saveProfile } from '../hooks/useProfile';
import { FormField } from '../components/FormField';

const USER_SUBCOLLECTIONS = ['tasks', 'exams', 'timetable'];

const deleteUserData = async (uid) => {
  for (const name of USER_SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db, 'users', uid, name));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, 'roommates', uid)).catch(() => {});
  await deleteDoc(doc(db, 'users', uid));
};

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useLanguage();
  const profile = useProfile();
  const user = auth.currentUser;

  // 'password' | 'delete' | null — both need the current password first.
  const [prompt, setPrompt] = useState(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);

  const closePrompt = () => { setPrompt(null); setCurrentPw(''); setNewPw(''); setBusy(false); };

  const changeLanguage = (code) => {
    setLang(code);
    saveProfile(user.uid, { language: code }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        onPress: () => signOut(auth).catch(() => Alert.alert(t('common.error'), t('settings.logoutFailed'))),
      },
    ]);
  };

  const authErrorMessage = (error) => {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') return t('settings.wrongPassword');
    if (error.code === 'auth/too-many-requests') return t('settings.tooManyAttempts');
    return t('common.tryAgain');
  };

  const handleConfirm = async () => {
    if (!currentPw) return;
    if (prompt === 'password' && newPw.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }
    setBusy(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPw));
      if (prompt === 'password') {
        await updatePassword(user, newPw);
        closePrompt();
        Alert.alert(t('settings.passwordChanged'));
      } else {
        await deleteUserData(user.uid);
        await deleteUser(user);
        // onAuthStateChanged in App.js takes the user back to Login.
      }
    } catch (error) {
      setBusy(false);
      Alert.alert(t('common.error'), authErrorMessage(error));
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('settings.deleteTitle'), t('settings.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteAccount'), style: 'destructive', onPress: () => setPrompt('delete') },
    ]);
  };

  const details = [
    profile?.university && profile?.campus ? `${profile.university} · ${profile.campus}` : profile?.university,
    [profile?.major, profile?.year && t(`profile.years.${profile.year}`)].filter(Boolean).join(' · '),
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.name || user?.email || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.name || t('settings.noName')}</Text>
            {details.map(line => <Text key={line} style={styles.profileMeta}>{line}</Text>)}
          </View>
        </View>
        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
        <View style={styles.group}>
          <Row label={t('settings.editProfile')} onPress={() => navigation.navigate('EditProfile')} />
          <Row label={t('settings.email')} value={user?.email} />
          <Row label={t('settings.changePassword')} onPress={() => setPrompt('password')} last />
        </View>

        <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
        <View style={styles.group}>
          {LANGUAGES.map((l, i) => (
            <Row
              key={l.code}
              label={l.label}
              onPress={() => changeLanguage(l.code)}
              check={lang === l.code}
              last={i === LANGUAGES.length - 1}
            />
          ))}
        </View>

        <View style={[styles.group, { marginTop: 28 }]}>
          <Row label={t('settings.logout')} onPress={handleLogout} />
          <Row label={t('settings.deleteAccount')} onPress={confirmDelete} danger last />
        </View>
      </ScrollView>

      <Modal visible={!!prompt} transparent animationType="slide" onRequestClose={closePrompt}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Text style={styles.sheetTitle}>
              {prompt === 'password' ? t('settings.changePassword') : t('settings.deleteTitle')}
            </Text>
            <Text style={styles.sheetSub}>{t('settings.enterCurrentPassword')}</Text>
            <View style={{ gap: 14 }}>
              <FormField
                label={t('settings.currentPassword')}
                value={currentPw}
                onChangeText={setCurrentPw}
                secureTextEntry
                autoFocus
              />
              {prompt === 'password' && (
                <FormField
                  label={t('settings.newPassword')}
                  placeholder={t('auth.passwordHint')}
                  value={newPw}
                  onChangeText={setNewPw}
                  secureTextEntry
                />
              )}
            </View>
            <View style={styles.sheetButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closePrompt} disabled={busy}>
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, (!currentPw || busy) && { opacity: 0.4 }]}
                onPress={handleConfirm}
                disabled={!currentPw || busy}
              >
                <Text style={styles.confirmText}>
                  {busy ? t('common.saving') : prompt === 'password' ? t('common.save') : t('settings.deleteAccount')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Row({ label, value, onPress, check, danger, last }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={[styles.row, !last && styles.rowBorder]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, danger && { color: Colors.primary }]}>{label}</Text>
      {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      {check ? <Text style={styles.check}>✓</Text> : null}
      {onPress && !check && !danger ? <Text style={styles.chevron}>›</Text> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500', marginBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  body: { padding: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  profileMeta: { fontSize: 13, color: Colors.textLight },
  bio: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: 14 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
    marginTop: 28, marginBottom: 10,
  },
  group: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  rowValue: { fontSize: 14, color: Colors.textLight, maxWidth: '55%' },
  check: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  chevron: { fontSize: 20, color: Colors.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontSize: 13, color: Colors.textLight, marginBottom: 18 },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  confirmText: { fontSize: 15, color: Colors.white, fontWeight: '700' },
});
