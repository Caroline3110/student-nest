import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Linking, KeyboardAvoidingView,
  Platform, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useProfile } from '../hooks/useProfile';
import { useSaved } from '../hooks/useSaved';
import { useT } from '../i18n';
import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import PressableScale from '../components/PressableScale';
import { auth, db } from '../firebase';
import {
  collection, doc, getDoc, onSnapshot, query, orderBy, writeBatch, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { sendEmailVerification } from 'firebase/auth';

const BUDGET_FILTERS = ['All', 'Under £600', '£600–£900', '£900–£1200', '£1200+'];

const LIFESTYLE_OPTIONS = [
  'Quiet', 'Social', 'Non-smoker', 'Smoker',
  'Pet-friendly', 'No pets', 'Early bird', 'Night owl', 'Tidy', 'Relaxed',
];

// Must match the reasons allowed in firestore.rules (/reports).
const REPORT_REASONS = ['fake', 'offensive', 'spam', 'other'];

const initials = (name) =>
  (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

// Hobbies are typed as one line; show them as separate pills like the rest of the tags.
const hobbyList = (hobbies) =>
  String(hobbies || '').split(/[,、;/]+/).map(h => h.trim()).filter(Boolean).slice(0, 5);

export default function RoommateFinderScreen({ navigation, route }) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const myUid = auth.currentUser?.uid;
  const saved = useSaved();
  const [activeTab, setActiveTab] = useState('find');
  const [roommates, setRoomates] = useState([]);
  const [blocked, setBlocked] = useState(new Set());
  const [reportTarget, setReportTarget] = useState(null);
  const [reportSent, setReportSent] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [uniFilter, setUniFilter] = useState('All');
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

  // Students this user has blocked, kept at /users/{uid}/blocked/{theirUid}.
  useEffect(() => {
    if (!myUid) return;
    return onSnapshot(collection(db, 'users', myUid, 'blocked'),
      snap => setBlocked(new Set(snap.docs.map(d => d.id))),
      err => console.error('Error loading blocked list:', err));
  }, [myUid]);

  const visible = roommates.filter(r => !blocked.has(r.id));

  // Opened from the Saved tab: show that profile as soon as it has loaded.
  const focusId = route?.params?.focus;
  useEffect(() => {
    if (!focusId) return;
    const match = visible.find(r => r.id === focusId);
    if (match) {
      setDetail(match);
      navigation.setParams({ focus: undefined });
    }
  }, [focusId, roommates]);

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

  // Universities actually posted, so a chip never leads to an empty list.
  const universities = ['All', ...Array.from(
    new Set(visible.map(r => r.university?.trim()).filter(Boolean))
  ).slice(0, 8)];

  const filtered = visible.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.name?.toLowerCase().includes(q) ||
      r.university?.toLowerCase().includes(q) ||
      r.area?.toLowerCase().includes(q) ||
      r.nationality?.toLowerCase().includes(q);
    const matchUni = uniFilter === 'All' || r.university?.trim() === uniFilter;
    return matchSearch && matchUni && matchesBudget(r.budget);
  });

  // Contacting and posting need a verified email (the rules check the
  // email_verified flag in the login token).
  const resendVerification = async () => {
    const email = auth.currentUser?.email;
    try {
      await sendEmailVerification(auth.currentUser);
      Alert.alert(t('verify.sentTitle'), t('verify.sent', { email }));
    } catch (err) {
      Alert.alert(t('common.error'),
        err.code === 'auth/too-many-requests' ? t('verify.wait') : t('verify.failed'));
    }
  };

  const checkVerified = async (onVerified) => {
    try {
      const user = auth.currentUser;
      await user.reload();
      if (!user.emailVerified) {
        Alert.alert(t('verify.notYetTitle'), t('verify.notYet'));
        return;
      }
      // The token still says unverified until it's refreshed.
      await user.getIdToken(true);
      onVerified();
    } catch {
      Alert.alert(t('common.error'), t('verify.failed'));
    }
  };

  const askToVerify = (onVerified) => {
    Alert.alert(t('verify.title'), t('verify.body', { email: auth.currentUser?.email }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('verify.resend'), onPress: resendVerification },
      { text: t('verify.done'), onPress: () => checkVerified(onVerified) },
    ]);
  };

  const whenVerified = (action) => {
    if (auth.currentUser?.emailVerified) action();
    else askToVerify(action);
  };

  const submitProfile = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('roommates.missingField'), t('roommates.enterName'));
      return;
    }
    if (!form.whatsapp.trim() && !form.email.trim()) {
      Alert.alert(t('roommates.contactRequired'), t('roommates.addContact'));
      return;
    }
    if (!auth.currentUser?.emailVerified) {
      askToVerify(submitProfile);
      return;
    }
    setSubmitting(true);
    try {
      // One profile per account: the doc ID is the user's UID, so posting
      // again replaces their previous profile instead of adding another.
      // Contact details go in a separate doc that only verified students can read.
      const uid = auth.currentUser.uid;
      const batch = writeBatch(db);
      batch.set(doc(db, 'roommates', uid), {
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
        createdAt: new Date().toISOString(),
      });
      batch.set(doc(db, 'roommates', uid, 'private', 'contact'), {
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
      });
      await batch.commit();
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

  const contactRoommate = async (r, retried = false) => {
    let contact;
    try {
      const snap = await getDoc(doc(db, 'roommates', r.id, 'private', 'contact'));
      contact = snap.data();
    } catch (err) {
      if (err.code !== 'permission-denied') {
        Alert.alert(t('common.error'), t('roommates.contactFailed'));
        return;
      }
      // Refused: either the login token predates verification (refresh once
      // and retry) or this student has blocked them.
      if (!retried) {
        await auth.currentUser.getIdToken(true).catch(() => {});
        contactRoommate(r, true);
      } else {
        Alert.alert(t('tutors.contactName', { name: r.name }), t('safety.unavailable'));
      }
      return;
    }
    if (!contact?.whatsapp && !contact?.email) {
      Alert.alert(t('tutors.contactName', { name: r.name }), t('roommates.noContact'));
      return;
    }
    const options = [];
    if (contact.whatsapp) {
      options.push({
        text: 'WhatsApp',
        onPress: () => openLink(`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`),
      });
    }
    if (contact.email) {
      options.push({
        text: t('auth.email'),
        onPress: () => openLink(`mailto:${contact.email.trim()}?subject=${encodeURIComponent('Roommate enquiry via Student Nest')}`),
      });
    }
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('tutors.contactName', { name: r.name }), t('tutors.howReach'), options);
  };

  const block = async (r) => {
    try {
      await setDoc(doc(db, 'users', myUid, 'blocked', r.id), {
        name: r.name || '', createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Block error:', err);
      Alert.alert(t('common.error'), t('common.tryAgain'));
    }
  };

  const confirmBlock = (r) => {
    Alert.alert(t('safety.blockTitle', { name: r.name }), t('safety.blockBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('safety.block'), style: 'destructive', onPress: () => block(r) },
    ]);
  };

  const closeReport = () => { setReportTarget(null); setReportSent(false); };

  const sendReport = async (reason) => {
    const r = reportTarget;
    try {
      await setDoc(doc(db, 'reports', `${myUid}_${r.id}`), {
        reporterUid: myUid, targetUid: r.id, reason, createdAt: serverTimestamp(),
      });
    } catch (err) {
      // Reporting the same profile twice is refused by the rules; the first
      // report still stands, so thank them either way.
      if (err.code !== 'permission-denied') {
        console.error('Report error:', err);
        closeReport();
        Alert.alert(t('common.error'), t('common.tryAgain'));
        return;
      }
    }
    setReportSent(true);
  };

  const openSafetyMenu = (r) => {
    Alert.alert(r.name, undefined, [
      { text: t('safety.report'), onPress: () => { setDetail(null); setReportTarget(r); } },
      { text: t('safety.block'), style: 'destructive', onPress: () => { setDetail(null); confirmBlock(r); } },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const toggleSave = (r) => saved.toggle(r.id, {
    type: 'roommate',
    name: r.name || '',
    university: r.university || '',
    year: r.year || '',
    area: r.area || '',
    budget: r.budget || 0,
  });

  const tags = (r) => (
    <>
      {r.lifestyle?.length > 0 && (
        <View style={styles.tagRow}>
          {r.lifestyle.map((l, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{t(`roommates.lifestyle.${l}`)}</Text>
            </View>
          ))}
        </View>
      )}
      {hobbyList(r.hobbies).length > 0 && (
        <View style={styles.tagRow}>
          {hobbyList(r.hobbies).map((h, i) => (
            <View key={i} style={styles.hobbyTag}>
              <Text style={styles.hobbyText}>{h}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        navigation={navigation}
        title={t('roommates.title')}
        subtitle={t(visible.length === 1 ? 'roommates.listedOne' : 'roommates.listed', { count: visible.length })}
        actions={[{
          icon: 'sliders',
          label: t('roommates.filters'),
          active: showFilters,
          onPress: () => setShowFilters(v => !v),
        }]}
      />

      <View style={styles.segment}>
        {[
          { key: 'find', label: t('roommates.findTab') },
          { key: 'add', label: t('roommates.addTab') },
        ].map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.segmentBtn, activeTab === tab.key && styles.segmentBtnActive]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={[styles.segmentText, activeTab === tab.key && styles.segmentTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── FIND TAB ── */}
      {activeTab === 'find' && (
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>

          <View style={styles.searchBar}>
            <Icon name="search" size={17} color={Colors.warmMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('roommates.searchPlaceholder')}
              placeholderTextColor={Colors.warmMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {universities.map(u => (
              <Pressable
                key={u}
                style={[styles.chip, uniFilter === u && styles.chipActive]}
                onPress={() => setUniFilter(u)}
              >
                <Text style={[styles.chipText, uniFilter === u && styles.chipTextActive]}>
                  {u === 'All' ? t('common.all') : u}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {showFilters && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {BUDGET_FILTERS.map(f => (
                <Pressable
                  key={f}
                  style={[styles.chip, budgetFilter === f && styles.chipActive]}
                  onPress={() => setBudgetFilter(f)}
                >
                  <Text style={[styles.chipText, budgetFilter === f && styles.chipTextActive]}>
                    {t(`roommates.budgetFilters.${f}`)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.brandDeep} style={styles.loader} />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Icon name="users" size={26} color={Colors.brandDeep} />
              </View>
              <Text style={styles.emptyTitle}>{t('roommates.noneFound')}</Text>
              <Text style={styles.emptySub}>
                {visible.length === 0 ? t('roommates.noneYet') : t('roommates.tryDifferent')}
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
                    <Text style={styles.cardName} numberOfLines={1}>{r.name}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {[r.university, r.year, r.nationality].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  {r.id !== myUid && (
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => toggleSave(r)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t(saved.ids.has(r.id) ? 'saved.remove' : 'roommates.save')}
                      >
                        <Icon
                          name="heart"
                          size={19}
                          color={saved.ids.has(r.id) ? Colors.brandDeep : Colors.warmMuted}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => openSafetyMenu(r)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('safety.menuLabel')}
                      >
                        <Icon name="more-horizontal" size={19} color={Colors.warmMuted} />
                      </Pressable>
                    </View>
                  )}
                </View>

                {r.budget > 0 && (
                  <View style={styles.factRow}>
                    <Icon name="dollar-sign" size={14} color={Colors.warmMuted} />
                    <Text style={styles.factText}>£{r.budget}{t('roommates.perMonth')}</Text>
                  </View>
                )}
                {r.area ? (
                  <View style={styles.factRow}>
                    <Icon name="map-pin" size={14} color={Colors.warmMuted} />
                    <Text style={styles.factText} numberOfLines={1}>{r.area}</Text>
                  </View>
                ) : null}

                {tags(r)}

                <PressableScale style={styles.viewBtn} scaleTo={0.98} onPress={() => setDetail(r)}>
                  <Text style={styles.viewBtnText}>{t('roommates.viewProfile')}</Text>
                </PressableScale>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ── ADD PROFILE TAB ── */}
      {activeTab === 'add' && (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
            {done ? (
              <View style={styles.successCard}>
                <View style={styles.successCircle}>
                  <Icon name="check" size={30} color={Colors.success} />
                </View>
                <Text style={styles.successTitle}>{t('roommates.posted')}</Text>
                <Text style={styles.successSub}>{t('roommates.postedSub')}</Text>
                <PressableScale style={styles.submitBtn} onPress={() => { setDone(false); setActiveTab('find'); }}>
                  <Text style={styles.submitBtnText}>{t('roommates.browse')}</Text>
                </PressableScale>
              </View>
            ) : (
              <>
                <Text style={styles.formIntro}>{t('roommates.intro')}</Text>

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
                      placeholderTextColor={Colors.warmMuted}
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
                      <Pressable
                        key={opt}
                        style={[styles.chip, lifestyle.includes(opt) && styles.chipActive]}
                        onPress={() => toggleLifestyle(opt)}
                      >
                        <Text style={[styles.chipText, lifestyle.includes(opt) && styles.chipTextActive]}>
                          {t(`roommates.lifestyle.${opt}`)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* About / looking for */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{t('roommates.lookingFor')}</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMulti]}
                    placeholder={t('roommates.lookingForPlaceholder')}
                    placeholderTextColor={Colors.warmMuted}
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
                        placeholderTextColor={Colors.warmMuted}
                        value={form[f.key]}
                        onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                        keyboardType={f.keyboard}
                        autoCapitalize="none"
                        maxLength={f.max}
                      />
                    </View>
                  ))}
                </View>

                <PressableScale
                  style={[styles.submitBtn, submitting && styles.submitBtnOff]}
                  onPress={submitProfile}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.submitBtnText}>{t('roommates.post')}</Text>}
                </PressableScale>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Full profile, opened from View profile. */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.cardTop}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>{initials(detail?.name)}</Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.detailName}>{detail?.name}</Text>
                  <Text style={styles.cardSub}>
                    {[detail?.university, detail?.year, detail?.nationality].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {detail && detail.id !== myUid && (
                  <Pressable
                    onPress={() => toggleSave(detail)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t(saved.ids.has(detail.id) ? 'saved.remove' : 'roommates.save')}
                  >
                    <Icon
                      name="heart"
                      size={21}
                      color={saved.ids.has(detail.id) ? Colors.brandDeep : Colors.warmMuted}
                    />
                  </Pressable>
                )}
              </View>

              {detail?.budget > 0 && (
                <View style={styles.factRow}>
                  <Icon name="dollar-sign" size={14} color={Colors.warmMuted} />
                  <Text style={styles.factText}>£{detail.budget}{t('roommates.perMonth')}</Text>
                </View>
              )}
              {detail?.area ? (
                <View style={styles.factRow}>
                  <Icon name="map-pin" size={14} color={Colors.warmMuted} />
                  <Text style={styles.factText}>{detail.area}</Text>
                </View>
              ) : null}

              {detail ? tags(detail) : null}

              {detail?.about ? <Text style={styles.detailAbout}>{detail.about}</Text> : null}

              {detail && detail.id !== myUid ? (
                <>
                  <PressableScale
                    style={styles.submitBtn}
                    onPress={() => whenVerified(() => contactRoommate(detail))}
                  >
                    <Text style={styles.submitBtnText}>
                      {t('tutors.contactName', { name: detail.name?.split(' ')[0] })}
                    </Text>
                  </PressableScale>
                  <Pressable style={styles.sheetCancel} onPress={() => openSafetyMenu(detail)}>
                    <Text style={styles.reportLink}>{t('safety.menuLabel')}</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.ownProfileNote}>{t('roommates.ownProfile')}</Text>
              )}

              <Pressable style={styles.sheetCancel} onPress={() => setDetail(null)}>
                <Text style={styles.sheetCancelText}>{t('common.close')}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Report: reasons, then thanks + "also block?" in the same sheet.
          (A sheet, since Android alerts only fit three buttons.) */}
      <Modal visible={!!reportTarget} transparent animationType="slide" onRequestClose={closeReport}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {reportSent ? (
              <>
                <Text style={styles.sheetTitle}>{t('safety.reportedTitle')}</Text>
                <Text style={styles.sheetSub}>{t('safety.reported', { name: reportTarget?.name })}</Text>
                <TouchableOpacity
                  style={styles.reasonBtn}
                  onPress={() => { block(reportTarget); closeReport(); }}
                >
                  <Text style={[styles.reasonText, styles.blockText]}>{t('safety.block')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetCancel} onPress={closeReport}>
                  <Text style={styles.sheetCancelText}>{t('safety.notNow')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>{t('safety.reportTitle', { name: reportTarget?.name })}</Text>
                <Text style={styles.sheetSub}>{t('safety.reportWhy')}</Text>
                {REPORT_REASONS.map(reason => (
                  <TouchableOpacity key={reason} style={styles.reasonBtn} onPress={() => sendReport(reason)}>
                    <Text style={styles.reasonText}>{t(`safety.reasons.${reason}`)}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.sheetCancel} onPress={closeReport}>
                  <Text style={styles.sheetCancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  flex: { flex: 1 },

  segment: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: Colors.brandDeep },
  segmentText: { fontSize: 13.5, fontWeight: '600', color: Colors.warmGrey },
  segmentTextActive: { color: Colors.white, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14.5, color: Colors.textPrimary },

  chips: { gap: 8, paddingBottom: 14, paddingRight: 4 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.brandDeep, borderColor: Colors.brandDeep },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.warmGrey },
  chipTextActive: { color: Colors.white },

  loader: { marginTop: 48 },
  empty: { alignItems: 'center', paddingTop: 50 },
  emptyIcon: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: Colors.blush,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13.5, color: Colors.warmGrey, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.blush,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.brandDeep },
  avatarLarge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.blush,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLargeText: { fontSize: 20, fontWeight: '700', color: Colors.brandDeep },
  cardMeta: { flex: 1 },
  cardName: { fontSize: 16.5, fontWeight: '700', color: Colors.textPrimary },
  detailName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  cardSub: { fontSize: 12.5, color: Colors.warmGrey, marginTop: 3 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  factRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 },
  factText: { flex: 1, fontSize: 13.5, color: Colors.textSecondary, fontWeight: '500' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 5 },
  tag: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  tagText: { fontSize: 11.5, fontWeight: '600', color: Colors.warmGrey },
  hobbyTag: {
    borderWidth: 1,
    borderColor: Colors.blush,
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  hobbyText: { fontSize: 11.5, fontWeight: '600', color: Colors.brandDeep },

  viewBtn: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: Colors.brandDeep,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  viewBtnText: { fontSize: 14, fontWeight: '700', color: Colors.brandDeep },

  detailAbout: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginTop: 14 },
  ownProfileNote: { fontSize: 13, color: Colors.warmGrey, textAlign: 'center', marginTop: 18 },
  reportLink: { fontSize: 13.5, fontWeight: '600', color: Colors.warmGrey },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '88%',
  },
  sheetTitle: { fontSize: 18.5, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  sheetSub: { fontSize: 13.5, color: Colors.warmGrey, marginBottom: 14, lineHeight: 20 },
  reasonBtn: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.creamBorder },
  reasonText: { fontSize: 15, color: Colors.textPrimary },
  blockText: { color: Colors.error, fontWeight: '700' },
  sheetCancel: { paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  sheetCancelText: { fontSize: 15, fontWeight: '700', color: Colors.textSecondary },

  formIntro: {
    fontSize: 13.5, color: Colors.textSecondary, lineHeight: 20,
    marginBottom: 20, padding: 15,
    backgroundColor: Colors.blush, borderRadius: 14,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10.5, fontWeight: '700', color: Colors.warmMuted,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 7,
  },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: 13,
    borderWidth: 1.5, borderColor: Colors.creamBorder,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14.5, color: Colors.textPrimary,
  },
  fieldInputMulti: { minHeight: 96, textAlignVertical: 'top' },

  lifestyleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  contactSection: {
    backgroundColor: Colors.blush,
    borderRadius: 16, padding: 15, marginBottom: 16,
  },
  contactSectionTitle: {
    fontSize: 12.5, fontWeight: '700', color: Colors.brandDeep, marginBottom: 12,
  },

  submitBtn: {
    backgroundColor: Colors.brandDeep, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 10,
  },
  submitBtnOff: { opacity: 0.6 },
  submitBtnText: { fontSize: 15.5, fontWeight: '700', color: Colors.white },

  successCard: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 16 },
  successCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.successLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  successSub: { fontSize: 14, color: Colors.warmGrey, textAlign: 'center', lineHeight: 21 },
});
