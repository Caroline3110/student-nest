import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert, Linking, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import useIsAdmin from '../hooks/useIsAdmin';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

const SUBJECTS = [
  'All', 'Maths', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Economics', 'Law', 'English',
  'History', 'Business', 'Psychology', 'Engineering', 'Statistics',
];

export default function TutorFinderScreen({ navigation }) {
  const t = useT();
  const [activeTab, setActiveTab] = useState('find');
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');

  // Hidden admin (only opens for users listed in /admins)
  const isAdmin = useIsAdmin();
  const [tapCount, setTapCount] = useState(0);
  const [adminVisible, setAdminVisible] = useState(false);

  // Application form
  const [appForm, setAppForm] = useState({
    name: '', email: '', university: '', year: '',
    subjects: '', rate: '', bio: '', cvLink: '', contact: '',
  });
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appDone, setAppDone] = useState(false);

  // Admin form
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', university: '', year: '',
    subjects: '', rate: '', bio: '', contact: '',
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // Load approved tutors from Firebase
  useEffect(() => {
    const q = query(collection(db, 'tutors'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, (snap) => {
      const loaded = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() }));
      setTutors(loaded);
      setLoading(false);
    }, (err) => {
      console.error('Error loading tutors:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Secret admin trigger — tap title 5 times
  const handleTitleTap = () => {
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      if (isAdmin) setAdminVisible(true);
    } else {
      setTapCount(next);
    }
  };

  // Submit tutor application (status: pending — reviewed manually in Firebase)
  const submitApplication = async () => {
    if (!appForm.name.trim() || !appForm.email.trim() || !appForm.subjects.trim()) {
      Alert.alert(t('exams.missingFields'), t('tutors.requiredApply'));
      return;
    }
    setAppSubmitting(true);
    try {
      await addDoc(collection(db, 'tutors'), {
        name: appForm.name.trim(),
        email: appForm.email.trim(),
        university: appForm.university.trim(),
        year: appForm.year.trim(),
        subjects: appForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
        rate: parseFloat(appForm.rate) || 0,
        bio: appForm.bio.trim(),
        cvLink: appForm.cvLink.trim(),
        contact: appForm.contact.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setAppDone(true);
      setAppForm({ name: '', email: '', university: '', year: '', subjects: '', rate: '', bio: '', cvLink: '', contact: '' });
    } catch (err) {
      console.error('Application error:', err);
      Alert.alert(t('common.error'), t('tutors.submitFailed'));
    } finally {
      setAppSubmitting(false);
    }
  };

  // Admin: add tutor directly (status: approved — appears immediately)
  const adminAddTutor = async () => {
    if (!adminForm.name.trim() || !adminForm.subjects.trim()) {
      Alert.alert(t('exams.missingFields'), t('tutors.requiredAdmin'));
      return;
    }
    setAdminSubmitting(true);
    try {
      await addDoc(collection(db, 'tutors'), {
        name: adminForm.name.trim(),
        email: adminForm.email.trim(),
        university: adminForm.university.trim(),
        year: adminForm.year.trim(),
        subjects: adminForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
        rate: parseFloat(adminForm.rate) || 0,
        bio: adminForm.bio.trim(),
        contact: adminForm.contact.trim(),
        status: 'approved',
        createdAt: new Date().toISOString(),
      });
      Alert.alert(t('tutors.done'), t('tutors.addedLive', { name: adminForm.name }));
      setAdminForm({ name: '', email: '', university: '', year: '', subjects: '', rate: '', bio: '', contact: '' });
    } catch (err) {
      console.error('Admin add error:', err);
      Alert.alert(t('common.error'), t('tutors.addFailed'));
    } finally {
      setAdminSubmitting(false);
    }
  };

  // Filter tutors by search + subject
  const filtered = tutors.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.name?.toLowerCase().includes(q) ||
      t.university?.toLowerCase().includes(q) ||
      t.subjects?.some(s => s.toLowerCase().includes(q));
    const matchSubject = subject === 'All' ||
      t.subjects?.some(s => s.toLowerCase() === subject.toLowerCase());
    return matchSearch && matchSubject;
  });

  const openLink = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(t('tutors.couldNotOpen'), t('tutors.noApp')));
  };

  const contactTutor = (tutor) => {
    const options = [];
    if (tutor.contact) {
      options.push({
        text: 'WhatsApp',
        onPress: () => openLink(`https://wa.me/${tutor.contact.replace(/\D/g, '')}`),
      });
    }
    if (tutor.email) {
      options.push({
        text: t('auth.email'),
        onPress: () => openLink(`mailto:${tutor.email.trim()}?subject=${encodeURIComponent('Tutoring enquiry via Student Nest')}`),
      });
    }
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('tutors.contactName', { name: tutor.name }), t('tutors.howReach'), options);
  };

  const initials = (name) =>
    (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();


  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
          <Text style={styles.headerTitle}>{t('home.features.tutors.name')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerSub}>{t(tutors.length === 1 ? 'tutors.oneAvailable' : 'tutors.nAvailable', { count: tutors.length })}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['find', 'apply'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'find' ? t('tutors.findTab') : t('tutors.applyTab')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── FIND A TUTOR ── */}
      {activeTab === 'find' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Search */}
          <TextInput
            style={styles.searchBar}
            placeholder={t('tutors.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {/* Subject chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, subject === s && styles.chipActive]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{t(`tutors.subjects.${s}`)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results */}
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('tutors.noneFound')}</Text>
              <Text style={styles.emptySub}>
                {tutors.length === 0
                  ? t('tutors.noneYet')
                  : t('tutors.tryDifferent')}
              </Text>
            </View>
          ) : (
            filtered.map(tutor => (
              <View key={tutor.id} style={styles.tutorCard}>
                <View style={styles.tutorTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(tutor.name)}</Text>
                  </View>
                  <View style={styles.tutorMeta}>
                    <Text style={styles.tutorName}>{tutor.name}</Text>
                    {tutor.university ? (
                      <Text style={styles.tutorUni}>{tutor.university}{tutor.year ? ` · ${tutor.year}` : ''}</Text>
                    ) : null}
                    <Text style={styles.tutorRate}>£{tutor.rate}{t('tutors.perHour')}</Text>
                  </View>
                </View>

                {/* Subject tags */}
                {tutor.subjects?.length > 0 && (
                  <View style={styles.subjectRow}>
                    {tutor.subjects.map((s, i) => (
                      <View key={i} style={styles.subjectTag}>
                        <Text style={styles.subjectTagText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Bio */}
                {tutor.bio ? (
                  <Text style={styles.tutorBio} numberOfLines={3}>{tutor.bio}</Text>
                ) : null}

                <TouchableOpacity style={styles.contactBtn} onPress={() => contactTutor(tutor)} activeOpacity={0.8}>
                  <Text style={styles.contactBtnText}>{t('tutors.contactName', { name: tutor.name.split(' ')[0] })}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── BECOME A TUTOR ── */}
      {activeTab === 'apply' && (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {appDone ? (
              <View style={styles.successCard}>
                <View style={styles.successCircle}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>{t('tutors.submitted')}</Text>
                <Text style={styles.successSub}>
                  {t('tutors.submittedSub')}
                </Text>
                <TouchableOpacity style={styles.successBtn} onPress={() => setAppDone(false)}>
                  <Text style={styles.successBtnText}>{t('tutors.submitAnother')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.applyIntro}>
                  {t('tutors.applyIntro')}
                </Text>

                {[
                  { label: `${t('profile.name')} *`, key: 'name', placeholder: t('profile.namePlaceholder') },
                  { label: `${t('auth.email')} *`, key: 'email', placeholder: 'your@email.com', keyboard: 'email-address' },
                  { label: t('profile.university'), key: 'university', placeholder: t('profile.universityPlaceholder') },
                  { label: t('profile.year'), key: 'year', placeholder: t('tutors.yearPlaceholder') },
                  { label: `${t('tutors.subjectsTeach')} *`, key: 'subjects', placeholder: t('tutors.subjectsPlaceholder') },
                  { label: t('tutors.rate'), key: 'rate', placeholder: '20', keyboard: 'decimal-pad' },
                  { label: t('tutors.bio'), key: 'bio', placeholder: t('tutors.bioPlaceholder'), multi: true },
                  { label: t('tutors.cvLink'), key: 'cvLink', placeholder: 'https://linkedin.com/in/yourprofile' },
                  { label: t('tutors.contact'), key: 'contact', placeholder: '+44 7700 900000' },
                ].map(f => (
                  <View key={f.key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <TextInput
                      style={[styles.fieldInput, f.multi && styles.fieldInputMulti]}
                      placeholder={f.placeholder}
                      placeholderTextColor={Colors.textMuted}
                      value={appForm[f.key]}
                      onChangeText={v => setAppForm(p => ({ ...p, [f.key]: v }))}
                      keyboardType={f.keyboard || 'default'}
                      multiline={!!f.multi}
                      numberOfLines={f.multi ? 4 : 1}
                      autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'sentences'}
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.submitBtn, appSubmitting && styles.submitBtnOff]}
                  onPress={submitApplication}
                  disabled={appSubmitting}
                  activeOpacity={0.8}
                >
                  {appSubmitting
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.submitBtnText}>{t('tutors.submit')}</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ── ADMIN ADD TUTOR MODAL ── */}
      <Modal visible={adminVisible} animationType="slide" onRequestClose={() => setAdminVisible(false)}>
        <SafeAreaView style={styles.adminScreen}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminTitle}>{t('tutors.addTutor')}</Text>
            <TouchableOpacity onPress={() => setAdminVisible(false)}>
              <Text style={styles.adminClose}>{t('tutors.done')}</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.adminNote}>
                {t('tutors.adminNote')}
              </Text>

              {[
                { label: `${t('profile.name')} *`, key: 'name', placeholder: t('profile.namePlaceholder') },
                { label: t('auth.email'), key: 'email', placeholder: 'tutor@email.com', keyboard: 'email-address' },
                { label: t('profile.university'), key: 'university', placeholder: 'UCL' },
                { label: t('profile.year'), key: 'year', placeholder: t('tutors.yearPlaceholder') },
                { label: `${t('tutors.subjectsTeach')} *`, key: 'subjects', placeholder: t('tutors.subjectsPlaceholder') },
                { label: t('tutors.rate'), key: 'rate', placeholder: '25', keyboard: 'decimal-pad' },
                { label: t('tutors.bio'), key: 'bio', placeholder: t('tutors.bioPlaceholder'), multi: true },
                { label: t('tutors.contact'), key: 'contact', placeholder: '+44 7700 900000' },
              ].map(f => (
                <View key={f.key} style={styles.field}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={[styles.fieldInput, f.multi && styles.fieldInputMulti]}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={adminForm[f.key]}
                    onChangeText={v => setAdminForm(p => ({ ...p, [f.key]: v }))}
                    keyboardType={f.keyboard || 'default'}
                    multiline={!!f.multi}
                    numberOfLines={f.multi ? 3 : 1}
                    autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'sentences'}
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitBtn, adminSubmitting && styles.submitBtnOff]}
                onPress={adminAddTutor}
                disabled={adminSubmitting}
                activeOpacity={0.8}
              >
                {adminSubmitting
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.submitBtnText}>{t('tutors.addTutor')}</Text>}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  /* Header */
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSub: { fontSize: 13, color: Colors.textLight },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  /* Search */
  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: Colors.textPrimary,
    marginBottom: 12,
  },

  /* Subject chips */
  chips: { gap: 8, paddingBottom: 16 },
  chip: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '600' },

  /* Empty / loader */
  loader: { marginTop: 48 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 20 },

  /* Tutor card */
  tutorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 12,
  },
  tutorTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  tutorMeta: { flex: 1 },
  tutorName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  tutorUni: { fontSize: 12, color: Colors.textSecondary, marginBottom: 3 },
  tutorRate: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  subjectTag: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  subjectTagText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  tutorBio: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  contactBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  contactBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  /* Apply form */
  applyIntro: {
    fontSize: 13, color: Colors.textSecondary, lineHeight: 20,
    marginBottom: 20, padding: 14,
    backgroundColor: Colors.primaryLight, borderRadius: 10,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 14, color: Colors.textPrimary,
  },
  fieldInputMulti: { minHeight: 90, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitBtnOff: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },

  /* Success */
  successCard: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  successCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  successIcon: { fontSize: 28, color: Colors.success },
  successTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  successBtn: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingVertical: 11, paddingHorizontal: 24,
  },
  successBtnText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },

  /* Admin modal */
  adminScreen: { flex: 1, backgroundColor: Colors.background },
  adminHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  adminTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  adminClose: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  adminNote: {
    fontSize: 13, color: Colors.textSecondary, lineHeight: 19,
    backgroundColor: Colors.successLight, borderRadius: 10,
    padding: 12, marginBottom: 20,
  },
});
