import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';

// Curated job sites by category (no AI). Descriptions live in i18n under
// jobs.sites.<id>; names are brand names and stay as-is.
const CATEGORIES = [
  { key: 'partTime', emoji: '⏰' },
  { key: 'hospitality', emoji: '☕' },
  { key: 'tutoring', emoji: '📖' },
  { key: 'mandarin', emoji: '🇨🇳' },
  { key: 'remote', emoji: '💻' },
  { key: 'internships', emoji: '🎯' },
];

const SITES = [
  { id: 'indeed', name: 'Indeed UK', url: 'https://uk.indeed.com/jobs?q=student+part+time', categories: ['partTime', 'hospitality'] },
  { id: 'studentjob', name: 'StudentJob UK', url: 'https://www.studentjob.co.uk', categories: ['partTime'] },
  { id: 'totaljobs', name: 'Totaljobs', url: 'https://www.totaljobs.com', categories: ['partTime'] },
  { id: 'gumtree', name: 'Gumtree Jobs', url: 'https://www.gumtree.com/jobs', categories: ['partTime', 'hospitality'] },
  { id: 'caterer', name: 'Caterer.com', url: 'https://www.caterer.com', categories: ['hospitality'] },
  { id: 'mytutor', name: 'MyTutor', url: 'https://www.mytutor.co.uk', categories: ['tutoring', 'remote'] },
  { id: 'tutorful', name: 'Tutorful', url: 'https://tutorful.co.uk', categories: ['tutoring', 'remote'] },
  { id: 'superprof', name: 'Superprof', url: 'https://www.superprof.co.uk', categories: ['tutoring', 'mandarin'] },
  { id: 'indeedMandarin', name: 'Indeed — Mandarin', url: 'https://uk.indeed.com/jobs?q=mandarin+part+time', categories: ['mandarin'] },
  { id: 'linkedinMandarin', name: 'LinkedIn — Mandarin', url: 'https://www.linkedin.com/jobs/search/?keywords=mandarin%20speaker&location=United%20Kingdom', categories: ['mandarin'] },
  { id: 'indeedRemote', name: 'Indeed — Remote', url: 'https://uk.indeed.com/jobs?q=remote+student', categories: ['remote'] },
  { id: 'prospects', name: 'Prospects', url: 'https://www.prospects.ac.uk', categories: ['internships'] },
  { id: 'ratemyplacement', name: 'RateMyPlacement', url: 'https://www.ratemyplacement.co.uk', categories: ['internships'] },
  { id: 'brightnetwork', name: 'Bright Network', url: 'https://www.brightnetwork.co.uk', categories: ['internships'] },
  { id: 'linkedin', name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs', categories: ['internships', 'remote'] },
];

const VISA_URL = 'https://www.gov.uk/student-visa/what-you-can-and-cannot-do';
const WAGE_URL = 'https://www.gov.uk/national-minimum-wage-rates';

export default function PartTimeJobsScreen({ navigation }) {
  const t = useT();
  const [category, setCategory] = useState('partTime');
  const sites = SITES.filter(s => s.categories.includes(category));

  const open = (url) =>
    Linking.openURL(url).catch(() => Alert.alert(t('common.error'), t('housing.cantOpenWebsite')));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('home.features.jobs.name')}</Text>
        <Text style={styles.headerSub}>{t('jobs.subtitle')}</Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {CATEGORIES.map(c => {
            const active = c.key === category;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.emoji} {t(`jobs.categories.${c.key}.name`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.tip}>{t(`jobs.categories.${category}.tip`)}</Text>

        {sites.map(site => (
          <TouchableOpacity key={site.id} style={styles.card} onPress={() => open(site.url)} activeOpacity={0.75}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{site.name}</Text>
              <Text style={styles.cardDesc}>{t(`jobs.sites.${site.id}`)}</Text>
            </View>
            <Text style={styles.openText}>{t('jobs.open')} ↗</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.rules}>
          <Text style={styles.rulesTitle}>{t('jobs.rulesTitle')}</Text>
          <Text style={styles.rulesText}>• {t('jobs.ruleHours')}</Text>
          <Text style={styles.rulesText}>• {t('jobs.ruleWage')}</Text>
          <Text style={styles.rulesText}>• {t('jobs.ruleScam')}</Text>
          <View style={styles.rulesLinks}>
            <TouchableOpacity onPress={() => open(VISA_URL)}>
              <Text style={styles.link}>{t('jobs.visaLink')} ↗</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => open(WAGE_URL)}>
              <Text style={styles.link}>{t('jobs.wageLink')} ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 12 },
  backText: { fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  filterBar: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  body: { padding: 16, gap: 10, paddingBottom: 32 },
  tip: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 14,
    padding: 14, backgroundColor: Colors.surface,
  },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  cardDesc: { fontSize: 13, color: Colors.textLight, lineHeight: 18 },
  openText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  rules: {
    marginTop: 14, padding: 16, borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  rulesTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  rulesText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 4 },
  rulesLinks: { flexDirection: 'row', gap: 18, marginTop: 8 },
  link: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
