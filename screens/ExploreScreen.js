import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import Icon, { FEATURE_ICONS } from '../components/Icon';
import PressableScale from '../components/PressableScale';

// Everything the app can do, grouped. Home shows the same features as a grid;
// this is the place to go looking when you don't know what you need yet.
const GROUPS = [
  { key: 'living', features: [
    { key: 'living', route: 'Accommodation' },
    { key: 'roommates', route: 'RoommateFinder' },
    { key: 'housekeeper', route: 'Housekeeper' },
  ] },
  { key: 'study', features: [
    { key: 'study', route: 'StudyDashboard' },
    { key: 'tutors', route: 'TutorFinder' },
  ] },
  { key: 'money', features: [
    { key: 'budget', route: 'BudgetTracker' },
    { key: 'jobs', route: 'PartTimeJobs' },
  ] },
  { key: 'support', features: [
    { key: 'wellbeing', route: 'Wellbeing' },
  ] },
];

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const matches = (key) =>
    !q ||
    t(`home.features.${key}.name`).toLowerCase().includes(q) ||
    t(`home.features.${key}.desc`).toLowerCase().includes(q);

  const groups = GROUPS
    .map(group => ({ ...group, features: group.features.filter(f => matches(f.key)) }))
    .filter(group => group.features.length > 0);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>{t('tabs.explore')}</Text>
        <Text style={styles.subtitle}>{t('explore.subtitle')}</Text>
        <View style={styles.search}>
          <Icon name="search" size={17} color={Colors.warmMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('explore.searchPlaceholder')}
            placeholderTextColor={Colors.warmMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        {groups.length === 0 ? (
          <Text style={styles.noResults}>{t('explore.noResults', { search: search.trim() })}</Text>
        ) : groups.map(group => (
          <View key={group.key} style={styles.group}>
            <Text style={styles.groupLabel}>{t(`explore.groups.${group.key}`)}</Text>
            <View style={styles.card}>
              {group.features.map((feature, i) => (
                <PressableScale
                  key={feature.key}
                  style={[styles.row, i < group.features.length - 1 && styles.rowBorder]}
                  scaleTo={0.99}
                  onPress={() => navigation.navigate(feature.route)}
                >
                  <View style={styles.rowIcon}>
                    <Icon name={FEATURE_ICONS[feature.key]} size={17} color={Colors.brandDeep} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{t(`home.features.${feature.key}.name`)}</Text>
                    <Text style={styles.rowDesc}>{t(`home.features.${feature.key}.desc`)}</Text>
                  </View>
                  <Icon name="chevron-right" size={19} color={Colors.warmMuted} />
                </PressableScale>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 20, paddingBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13.5, color: Colors.warmGrey, marginTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14.5, color: Colors.textPrimary },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  noResults: { fontSize: 14, color: Colors.warmGrey, textAlign: 'center', paddingTop: 40 },
  group: { marginBottom: 22 },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.creamBorder },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: { fontSize: 14.5, fontWeight: '700', color: Colors.textPrimary },
  rowDesc: { fontSize: 12.5, color: Colors.warmGrey, marginTop: 2 },
});
