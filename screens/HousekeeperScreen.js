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
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const SORT_OPTIONS = ['Default', 'Cheapest first', 'Most expensive'];

const initials = (name) =>
  (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function HousekeeperScreen({ navigation }) {
  const t = useT();
  const [housekeepers, setHousekeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Default');

  // Hidden admin (only opens for users listed in /admins)
  const isAdmin = useIsAdmin();
  const [tapCount, setTapCount] = useState(0);
  const [adminVisible, setAdminVisible] = useState(false);

  // Admin form
  const [adminForm, setAdminForm] = useState({
    name: '', area: '', services: '', rate: '',
    availability: '', experience: '', bio: '', contact: '',
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'housekeepers'), (snap) => {
      const loaded = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() }));
      setHousekeepers(loaded);
      setLoading(false);
    }, (err) => {
      console.error('Error loading housekeepers:', err);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleTitleTap = () => {
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      if (isAdmin) setAdminVisible(true);
    } else {
      setTapCount(next);
    }
  };

  const adminAddHousekeeper = async () => {
    if (!adminForm.name.trim()) {
      Alert.alert(t('roommates.missingField'), t('housekeeper.nameRequired'));
      return;
    }
    setAdminSubmitting(true);
    try {
      await addDoc(collection(db, 'housekeepers'), {
        name: adminForm.name.trim(),
        area: adminForm.area.trim(),
        services: adminForm.services.split(',').map(s => s.trim()).filter(Boolean),
        rate: parseFloat(adminForm.rate) || 0,
        availability: adminForm.availability.trim(),
        experience: adminForm.experience.trim(),
        bio: adminForm.bio.trim(),
        contact: adminForm.contact.trim(),
        createdAt: new Date().toISOString(),
      });
      Alert.alert(t('tutors.done'), t('tutors.addedLive', { name: adminForm.name }));
      setAdminForm({ name: '', area: '', services: '', rate: '', availability: '', experience: '', bio: '', contact: '' });
    } catch (err) {
      console.error('Admin add error:', err);
      Alert.alert(t('common.error'), t('housekeeper.addFailed'));
    } finally {
      setAdminSubmitting(false);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(t('tutors.couldNotOpen'), t('tutors.noApp')));
  };

  const contactHousekeeper = (h) => {
    const options = [];
    const contact = h.contact?.trim();
    if (contact) {
      if (contact.includes('@')) {
        const subject = encodeURIComponent('Housekeeper enquiry via Student Nest');
        options.push({
          text: t('auth.email'),
          onPress: () => openLink(`mailto:${contact}?subject=${subject}`),
        });
      } else {
        const cleaned = contact.replace(/\D/g, '');
        if (cleaned.length >= 7) {
          options.push({
            text: 'WhatsApp',
            onPress: () => openLink(`https://wa.me/${cleaned}`),
          });
        }
      }
    }
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('tutors.contactName', { name: h.name }), t('tutors.howReach'), options);
  };

  const sorted = [...housekeepers]
    .filter(h => {
      const q = search.toLowerCase();
      return !q ||
        h.name?.toLowerCase().includes(q) ||
        h.area?.toLowerCase().includes(q) ||
        h.services?.some(s => s.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === 'Cheapest first') return (a.rate || 0) - (b.rate || 0);
      if (sort === 'Most expensive') return (b.rate || 0) - (a.rate || 0);
      return 0;
    });

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
          <Text style={styles.headerTitle}>{t('home.features.housekeeper.name')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerSub}>{t('housekeeper.availableNear', { count: housekeepers.length })}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <TextInput
          style={styles.searchBar}
          placeholder={t('housekeeper.searchPlaceholder')}
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Sort chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, sort === opt && styles.chipActive]}
              onPress={() => setSort(opt)}
            >
              <Text style={[styles.chipText, sort === opt && styles.chipTextActive]}>{t(`housekeeper.sort.${opt}`)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : sorted.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('housekeeper.noneFound')}</Text>
            <Text style={styles.emptySub}>
              {housekeepers.length === 0
                ? t('housekeeper.noneYet')
                : t('housekeeper.tryDifferent')}
            </Text>
          </View>
        ) : (
          sorted.map(h => (
            <View key={h.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(h.name)}</Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardName}>{h.name}</Text>
                  {h.area ? <Text style={styles.cardArea}>📍 {h.area}</Text> : null}
                  {h.experience ? <Text style={styles.cardExp}>{t('housekeeper.experience', { value: h.experience })}</Text> : null}
                </View>
                {h.rate > 0 && (
                  <View style={styles.rateBadge}>
                    <Text style={styles.rateText}>£{h.rate}{t('tutors.perHour')}</Text>
                  </View>
                )}
              </View>

              {h.services?.length > 0 && (
                <View style={styles.tagRow}>
                  {h.services.map((s, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}

              {h.availability ? (
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>{t('housing.available')}: </Text>
                  <Text style={styles.availValue}>{h.availability}</Text>
                </View>
              ) : null}

              {h.bio ? (
                <Text style={styles.cardBio} numberOfLines={3}>{h.bio}</Text>
              ) : null}

              <TouchableOpacity style={styles.contactBtn} onPress={() => contactHousekeeper(h)} activeOpacity={0.8}>
                <Text style={styles.contactBtnText}>{t('tutors.contactName', { name: h.name.split(' ')[0] })}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── ADMIN ADD HOUSEKEEPER MODAL ── */}
      <Modal visible={adminVisible} animationType="slide" onRequestClose={() => setAdminVisible(false)}>
        <SafeAreaView style={styles.adminScreen}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminTitle}>{t('housekeeper.add')}</Text>
            <TouchableOpacity onPress={() => setAdminVisible(false)}>
              <Text style={styles.adminClose}>{t('tutors.done')}</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.adminNote}>
                {t('housekeeper.adminNote')}
              </Text>

              {[
                { label: `${t('profile.name')} *`, key: 'name', placeholder: 'Maria Santos' },
                { label: t('housekeeper.area'), key: 'area', placeholder: 'East London, Hackney, Brixton' },
                { label: t('housekeeper.services'), key: 'services', placeholder: 'Cleaning, Ironing, Laundry, Cooking' },
                { label: t('tutors.rate'), key: 'rate', placeholder: '15', keyboard: 'decimal-pad' },
                { label: t('housekeeper.availability'), key: 'availability', placeholder: 'Mon–Fri 9am–5pm, weekends' },
                { label: t('housekeeper.yearsExperience'), key: 'experience', placeholder: '5 years' },
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
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitBtn, adminSubmitting && styles.submitBtnOff]}
                onPress={adminAddHousekeeper}
                disabled={adminSubmitting}
                activeOpacity={0.8}
              >
                {adminSubmitting
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.submitBtnText}>{t('housekeeper.add')}</Text>}
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

  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSub: { fontSize: 13, color: Colors.textLight },

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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  cardMeta: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  cardArea: { fontSize: 12, color: Colors.textSecondary, marginBottom: 1 },
  cardExp: { fontSize: 12, color: Colors.textLight },
  rateBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  rateText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: {
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  availRow: { flexDirection: 'row', marginBottom: 8 },
  availLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  availValue: { fontSize: 12, color: Colors.textSecondary, flex: 1 },

  cardBio: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 12 },

  contactBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  contactBtnText: { fontSize: 14, fontWeight: '600', color: Colors.white },

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
  fieldInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitBtnOff: { opacity: 0.5 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },

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
