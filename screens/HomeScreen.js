import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { useT } from '../i18n';
import { useProfile } from '../hooks/useProfile';

const FEATURES = [
  { key: 'living', emoji: '🏠', route: 'StudentLiving' },
  { key: 'budget', emoji: '💰', route: 'BudgetTracker' },
  { key: 'study', emoji: '📚', route: 'StudyDashboard' },
  { key: 'tutors', emoji: '🎓', route: 'TutorFinder' },
  { key: 'roommates', emoji: '🤝', route: 'RoommateFinder' },
  { key: 'housekeeper', emoji: '✨', route: 'Housekeeper' },
  { key: 'jobs', emoji: '💼', route: 'PartTimeJobs' },
  { key: 'wellbeing', emoji: '🌿', route: 'Wellbeing' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const profile = useProfile();
  const firstName = profile?.name?.split(' ')[0];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>
            {firstName ? t('home.greetingName', { name: firstName }) : t('home.greeting')}
          </Text>
          <Text style={styles.headerTitle}>Student Nest</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
          <Text style={styles.settingsText}>⚙︎  {t('settings.title')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        <Text style={styles.sectionLabel}>{t('home.yourFeatures')}</Text>

        <View style={styles.grid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.key}
              style={styles.card}
              onPress={() => navigation.navigate(feature.route)}
              activeOpacity={0.75}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{feature.emoji}</Text>
              </View>
              <Text style={styles.cardName}>{t(`home.features.${feature.key}.name`)}</Text>
              <Text style={styles.cardDesc}>{t(`home.features.${feature.key}.desc`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  settingsButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  settingsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 22,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
});
