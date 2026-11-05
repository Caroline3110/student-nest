import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Colors from '../constants/Colors';
import { LANGUAGES, useLanguage } from '../i18n';
import { useProfile, saveProfile } from '../hooks/useProfile';
import Icon from '../components/Icon';
import PressableScale from '../components/PressableScale';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useLanguage();
  const profile = useProfile();
  const user = auth.currentUser;

  const changeLanguage = (code) => {
    setLang(code);
    if (user) saveProfile(user.uid, { language: code }).catch(() => {});
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: () => signOut(auth).catch(() => Alert.alert(t('common.error'), t('settings.logoutFailed'))),
      },
    ]);
  };

  const details = [
    profile?.university && profile?.campus
      ? `${profile.university} · ${profile.campus}`
      : profile?.university,
    [profile?.major, profile?.year && t(`profile.years.${profile.year}`)].filter(Boolean).join(' · '),
  ].filter(Boolean);

  const links = [
    { icon: 'edit-3', label: t('settings.editProfile'), onPress: () => navigation.navigate('EditProfile') },
    { icon: 'users', label: t('profileTab.myRoommatePost'), onPress: () => navigation.navigate('RoommateFinder') },
    { icon: 'bookmark', label: t('tabs.saved'), onPress: () => navigation.navigate('Saved') },
    { icon: 'settings', label: t('settings.title'), onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>{t('tabs.profile')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user?.email || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name || t('settings.noName')}</Text>
          {details.map(line => <Text key={line} style={styles.detail}>{line}</Text>)}
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <View style={styles.card}>
          {links.map((link, i) => (
            <PressableScale
              key={link.icon}
              style={[styles.row, i < links.length - 1 && styles.rowBorder]}
              scaleTo={0.99}
              onPress={link.onPress}
            >
              <View style={styles.rowIcon}>
                <Icon name={link.icon} size={16} color={Colors.brandDeep} />
              </View>
              <Text style={styles.rowLabel}>{link.label}</Text>
              <Icon name="chevron-right" size={19} color={Colors.warmMuted} />
            </PressableScale>
          ))}
        </View>

        <Text style={styles.groupLabel}>{t('settings.language')}</Text>
        <View style={styles.card}>
          {LANGUAGES.map((l, i) => (
            <PressableScale
              key={l.code}
              style={[styles.row, i < LANGUAGES.length - 1 && styles.rowBorder]}
              scaleTo={0.99}
              onPress={() => changeLanguage(l.code)}
            >
              <Text style={styles.rowLabel}>{l.label}</Text>
              {lang === l.code ? <Icon name="check" size={18} color={Colors.brandDeep} /> : null}
            </PressableScale>
          ))}
        </View>

        <PressableScale style={styles.logout} onPress={handleLogout}>
          <Icon name="log-out" size={17} color={Colors.brandDeep} />
          <Text style={styles.logoutText}>{t('settings.logout')}</Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 20, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },

  scroll: { paddingHorizontal: 20, paddingTop: 18 },
  identity: { alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.brandDeep },
  name: { fontSize: 21, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  detail: { fontSize: 13.5, color: Colors.warmGrey, marginTop: 4 },
  email: { fontSize: 12.5, color: Colors.warmMuted, marginTop: 6 },
  bio: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },

  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.creamBorder },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 14.5, color: Colors.textPrimary, fontWeight: '600' },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.brandDeep,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 24,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.brandDeep },
});
