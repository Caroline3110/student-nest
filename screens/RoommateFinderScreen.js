import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useProfile } from '../hooks/useProfile';
import { useT } from '../i18n';
import { auth, db } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const BUDGET_FILTERS = ['All', 'Under £600', '£600–£900', '£900–£1200', '£1200+'];

const LIFESTYLE_OPTIONS = [
  'Quiet', 'Social', 'Non-smoker', 'Smoker',
  'Pet-friendly', 'No pets', 'Early bird', 'Night owl', 'Tidy', 'Relaxed',
];

const initials = (name) =>
  (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function RoommateFinderScreen({ navigation }) {
  const t = useT();
  const [activeTab, setActiveTab] = useState('find');
  const [roommates, setRoomates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('All');

  // Add profile form
  // Start from the student's profile so they don't type it twice.
  const profile = useProfile();
  const [form, setForm] = useState({
    name: profile?.name || '',
    nationality: '',
    university: profile?.university || '',
    year: profile?.year ? t(`profile.years.${profile.year}`) : '',
    budget: '', area: '', hobbies: '', about: '',
    whatsapp: '', email: '',
  });
  const [lifestyle, setLifestyle] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'roommates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const loaded = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() }));
      setRoomates(loaded);
      setLoading(false);
    }, (err) => {
      console.error('Error loading roommates:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const toggleLifestyle = (option) => {
    setLifestyle(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const matchesBudget = (budget) => {
    const b = parseFloat(budget) || 0;
    if (budgetFilter === 'All') return true;
    if (budgetFilter === 'Under £600') return b < 600;
    if (budgetFilter === '£600–£900') return b >= 600 && b <= 900;
    if (budgetFilter === '£900–£1200') return b > 900 && b <= 1200;
    if (budgetFilter === '£1200+') return b > 1200;
    return true;
  };

  const filtered = roommates.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.name?.toLowerCase().includes(q) ||
      r.university?.toLowerCase().includes(q) ||
      r.area?.toLowerCase().includes(q) ||
      r.nationality?.toLowerCase().includes(q);
    return matchSearch && matchesBudget(r.budget);
  });

  const submitProfile = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('roommates.missingField'), t('roommates.enterName'));
      return;
    }
    if (!form.whatsapp.trim() && !form.email.trim()) {
      Alert.alert(t('roommates.contactRequired'), t('roommates.addContact'));
      return;
    }
    setSubmitting(true);
    try {
      // One profile per account: the doc ID is the user's UID, so posting
      // again replaces their previous profile instead of adding another.
      const uid = auth.currentUser.uid;
      await setDoc(doc(db, 'roommates', uid), {
        ownerUid: uid,
        name: form.name.trim(),
        nationality: form.nationality.trim(),
        university: form.university.trim(),
        year: form.year.trim(),
        budget: parseFloat(form.budget) || 0,
        area: form.area.trim(),
        hobbies: form.hobbies.trim(),
        lifestyle,
        about: form.about.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        createdAt: new Date().toISOString(),
      });
      setDone(true);
      setForm({ name: '', nationality: '', university: '', year: '', budget: '', area: '', hobbies: '', about: '', whatsapp: '', email: '' });
      setLifestyle([]);
    } catch (err) {
      console.error('Roommate submit error:', err);
      Alert.alert(t('common.error'), t('tutors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(t('tutors.couldNotOpen'), t('tutors.noApp')));
  };

  const contactRoommate = (r) => {
    const options = [];
    if (r.whatsapp) {
      options.push({
        text: 'WhatsApp',
        onPress: () => openLink(`https://wa.me/${r.whatsapp.replace(/\D/g, '')}`),
      });
    }
    if (r.email) {
      options.push({
        text: t('auth.email'),
        onPress: () => openLink(`mailto:${r.email.trim()}?subject=${encodeURIComponent('Roommate enquiry via Student Nest')}`),
      });
    }
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('tutors.contactName', { name: r.name }), t('tutors.howReach'), options);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('roommates.title')}</Text>
        <Text style={styles.headerSub}>{roommates.length} profile{roommates.length !== 1 ? 's' : ''} listed</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'find', label: t('roommates.findTab') },
          { key: 'add', label: t('roommates.addTab') },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── FIND TAB ── */}
      {activeTab === 'find' && (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <TextInput
            style={styles.searchBar}
            placeholder={t('roommates.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {/* Budget filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {BUDGET_FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.chip, budgetFilter === f && styles.chipActive]}
                onPress={() => setBudgetFilter(f)}
              >
                <Text style={[styles.chipText, budgetFilter === f && styles.chipTextActive]}>{t(`roommates.budgetFilters.${f}`)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('roommates.noneFound')}</Text>
              <Text style={styles.emptySub}>
                {roommates.length === 0
                  ? t('roommates.noneYet')
                  : t('roommates.tryDifferent')}
              </Text>
            </View>
          ) : (
            filtered.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(r.name)}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardName}>{r.name}</Text>
                    {r.nationality ? <Text style={styles.cardSub}>{r.nationality}</Text> : null}
                    {r.university ? (
                      <Text style={styles.cardSub}>
                        {r.university}{r.year ? ` · ${r.year}` : ''}
                      </Text>
                    ) : null}
                  </View>
                  {r.budget > 0 && (
                    <View style={styles.budgetBadge}>
                      <Text style={styles.budgetText}>£{r.budget}{t('roommates.perMonth')}</Text>
                    </View>
                  )}
                </View>

                {r.area ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('roommates.area')}</Text>
                    <Text style={styles.infoValue}>{r.area}</Text>
                  </View>
                ) : null}

                {r.hobbies ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>{t('roommates.hobbies')}</Text>
                    <Text style={styles.infoValue}>{r.hobbies}</Text>
                  </View>
                ) : null}

                {r.lifestyle?.length > 0 && (
                  <View style={styles.tagRow}>
                    {r.lifestyle.map((l, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{t(`roommates.lifestyle.${l}`)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {r.about ? (
                  <Text style={styles.cardAbout} numberOfLines={3}>{r.about}</Text>
                ) : null}

                <TouchableOpacity style={styles.contactBtn} onPress={() => contactRoommate(r)} activeOpacity={0.8}>
                  <Text style={styles.contactBtnText}>{t('tutors.contactName', { name: r.name.split(' ')[0] })}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── ADD PROFILE TAB ── */}
      {activeTab === 'add' && (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {done ? (
              <View style={styles.successCard}>
                <View style={styles.successCircle}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.successTitle}>{t('roommates.posted')}</Text>
                <Text style={styles.successSub}>
                  {t('roommates.postedSub')}
                </Text>
                <TouchableOpacity style={styles.successBtn} onPress={() => { setDone(false); setActiveTab('find'); }}>
                  <Text style={styles.successBtnText}>{t('roommates.browse')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.formIntro}>
                  {t('roommates.intro')}
                </Text>

                {[
                  { label: `${t('profile.name')} *`, key: 'name', max: 80, placeholder: t('profile.namePlaceholder') },
                  { label: t('roommates.nationality'), key: 'nationality', max: 60, placeholder: t('roommates.nationalityPlaceholder') },
                  { label: t('profile.university'), key: 'university', max: 120, placeholder: t('profile.universityPlaceholder') },
                  { label: t('profile.year'), key: 'year', max: 30, placeholder: t('tutors.yearPlaceholder') },
                  { label: t('roommates.budget'), key: 'budget', max: 10, placeholder: '800', keyboard: 'decimal-pad' },
                  { label: t('roommates.preferredArea'), key: 'area', max: 120, placeholder: t('roommates.areaPlaceholder') },
                  { label: t('roommates.hobbiesLabel'), key: 'hobbies', max: 300, placeholder: t('roommates.hobbiesPlaceholder') },
                ].map(f => (
                  <View key={f.key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder={f.placeholder}
                      placeholderTextColor={Colors.textMuted}
                      value={form[f.key]}
                      onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                      keyboardType={f.keyboard || 'default'}
                      maxLength={f.max}
                    />
                  </View>
                ))}

                {/* Lifestyle chips */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t('roommates.lifestyleLabel')}</Text>
                  <View style={styles.lifestyleGrid}>
                    {LIFESTYLE_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.lifestyleChip, lifestyle.includes(opt) && styles.lifestyleChipActive]}
                        onPress={() => toggleLifestyle(opt)}
                      >
                        <Text style={[styles.lifestyleText, lifestyle.includes(opt) && styles.lifestyleTextActive]}>
                          {t(`roommates.lifestyle.${opt}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* About / looking for */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t('roommates.lookingFor')}</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMulti]}
                    placeholder={t('roommates.lookingForPlaceholder')}
                    placeholderTextColor={Colors.textMuted}
                    value={form.about}
                    onChangeText={v => setForm(p => ({ ...p, about: v }))}
                    multiline
                    numberOfLines={4}
                    maxLength={1000}
                  />
                </View>

                <View style={styles.contactSection}>
                  <Text style={styles.contactSectionTitle}>{t('roommates.contactDetails')}</Text>
                  {[
                    { label: t('roommates.whatsapp'), key: 'whatsapp', max: 30, placeholder: '+44 7700 900000', keyboard: 'phone-pad' },
                    { label: t('auth.email'), key: 'email', max: 120, placeholder: 'your@email.com', keyboard: 'email-address' },
                  ].map(f => (
                    <View key={f.key} style={styles.field}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      <TextInput
                        style={styles.fieldInput}
                        placeholder={f.placeholder}
                        placeholderTextColor={Colors.textMuted}
                        value={form[f.key]}
                        onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                        keyboardType={f.keyboard}
                        autoCapitalize="none"
                        maxLength={f.max}
                      />
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.submitBtnOff]}
                  onPress={submitProfile}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.submitBtnText}>{t('roommates.post')}</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSub: { fontSize: 13, color: Colors.textLight },

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

  scroll: { flex: 1 },
  scrollContent: { padding: 16 },

  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: Colors.textPrimary, marginBottom: 12,
  },

  chips: { gap: 8, paddingBottom: 16 },
  chip: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white, fontWeight: '600' },

  loader: { marginTop: 48 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  cardMeta: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 1 },
  budgetBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  budgetText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, width: 54 },
  infoValue: { fontSize: 12, color: Colors.textSecondary, flex: 1 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, marginBottom: 8 },
  tag: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  cardAbout: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 12, marginTop: 4 },

  contactBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  contactBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

  formIntro: {
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

  lifestyleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lifestyleChip: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.surface,
  },
  lifestyleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  lifestyleText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  lifestyleTextActive: { color: Colors.white, fontWeight: '600' },

  contactSection: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12, padding: 14, marginBottom: 14,
  },
  contactSectionTitle: {
    fontSize: 12, fontWeight: '600', color: Colors.primary, marginBottom: 12,
  },

  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitBtnOff: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },

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
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 28,
  },
  successBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});
