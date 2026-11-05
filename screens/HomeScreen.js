import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Colors from '../constants/Colors';
import { useLanguage, translate } from '../i18n';
import { useProfile } from '../hooks/useProfile';
import Icon, { FEATURE_ICONS } from '../components/Icon';
import PressableScale from '../components/PressableScale';

const FEATURES = [
  { key: 'living', route: 'Accommodation' },
  { key: 'roommates', route: 'RoommateFinder' },
  { key: 'study', route: 'StudyDashboard' },
  { key: 'tutors', route: 'TutorFinder' },
  { key: 'housekeeper', route: 'Housekeeper' },
  { key: 'jobs', route: 'PartTimeJobs' },
  { key: 'budget', route: 'BudgetTracker' },
  { key: 'wellbeing', route: 'Wellbeing' },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Monday to Friday of the week the given day falls in. Saturday and Sunday
// look ahead to the coming week, so the strip is never all in the past.
const weekDays = (today) => {
  const start = new Date(today);
  const weekday = start.getDay(); // 0 Sun … 6 Sat
  const offsetToMonday = weekday === 0 ? 1 : weekday === 6 ? 2 : 1 - weekday;
  start.setDate(start.getDate() + offsetToMonday);
  return WEEKDAYS.map((name, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { name, date };
  });
};

const greetingKey = (hour) =>
  hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

const sameDay = (a, b) => a.toDateString() === b.toDateString();

// The next class still to come this week: today's remaining ones first,
// then the earliest class on each following weekday.
const findNextClass = (classes, now) => {
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = WEEKDAYS.indexOf(todayName);
  const byTime = (a, b) => String(a.startTime).localeCompare(String(b.startTime));

  if (todayIndex !== -1) {
    const later = classes
      .filter(c => c.day === todayName && String(c.endTime) > hhmm)
      .sort(byTime);
    if (later.length) return { cls: later[0], today: true };
  }
  const from = todayIndex === -1 ? 0 : todayIndex + 1;
  for (let i = from; i < WEEKDAYS.length; i++) {
    const onDay = classes.filter(c => c.day === WEEKDAYS[i]).sort(byTime);
    if (onDay.length) return { cls: onDay[0], today: false };
  }
  return null;
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const profile = useProfile();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return onSnapshot(
      collection(db, 'users', uid, 'timetable'),
      snap => setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Error loading timetable:', err),
    );
  }, []);

  const now = new Date();
  const firstName = profile?.name?.split(' ')[0];
  const key = `home.${greetingKey(now.getHours())}`;
  const vars = { name: firstName };
  // The greeting is shown twice, once in each language — the app is for
  // London students who often study in both.
  const greeting = firstName ? t(key, vars) : t(`${key}Plain`);
  const otherLang = lang === 'en' ? 'zh' : 'en';
  const greetingOther = firstName
    ? translate(otherLang, key, vars)
    : translate(otherLang, `${key}Plain`);

  const next = findNextClass(classes, now);

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.brand}>
          <Icon name="home" size={19} color={Colors.brandDeep} />
          <Text style={styles.brandText}>studentnest.</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable
            onPress={() => navigation.navigate('Exams')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('home.reminders')}
          >
            <Icon name="bell" size={21} color={Colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel={t('tabs.profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(profile?.name || auth.currentUser?.email || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.greetingAlt}>{greetingOther}</Text>
        <Text style={styles.encouragement}>{t('home.encouragement')}</Text>

        <View style={styles.weekRow}>
          {weekDays(now).map(({ name, date }) => {
            const isToday = sameDay(date, now);
            return (
              <View key={name} style={[styles.day, isToday && styles.dayToday]}>
                <Text style={[styles.dayName, isToday && styles.dayTextToday]}>
                  {t(`daysShort.${name}`)}
                </Text>
                <Text style={[styles.dayNum, isToday && styles.dayTextToday]}>
                  {date.getDate()}
                </Text>
              </View>
            );
          })}
        </View>

        {next && (
          <PressableScale
            style={styles.nextCard}
            scaleTo={0.985}
            onPress={() => navigation.navigate('StudyDashboard')}
          >
            <View style={styles.nextBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.nextLabel}>
                {next.today ? t('home.nextClass') : t(`days.${next.cls.day}`)}
              </Text>
              <Text style={styles.nextSubject} numberOfLines={1}>{next.cls.subject}</Text>
              <Text style={styles.nextMeta} numberOfLines={1}>
                {next.cls.startTime} – {next.cls.endTime}
                {next.cls.location && next.cls.location !== 'TBA' ? ` · ${next.cls.location}` : ''}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.brandDeep} />
          </PressableScale>
        )}

        <View style={styles.grid}>
          {FEATURES.map(feature => (
            <PressableScale
              key={feature.key}
              style={styles.card}
              scaleTo={0.97}
              onPress={() => navigation.navigate(feature.route)}
            >
              <View style={styles.cardIcon}>
                <Icon name={FEATURE_ICONS[feature.key]} size={17} color={Colors.brandDeep} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{t(`home.features.${feature.key}.name`)}</Text>
                <Text style={styles.cardDesc}>{t(`home.features.${feature.key}.desc`)}</Text>
              </View>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandText: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.brandDeep },

  scroll: { paddingHorizontal: 20, paddingTop: 6 },
  greeting: { fontSize: 25, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.6 },
  greetingAlt: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 2 },
  encouragement: { fontSize: 14, color: Colors.warmGrey, marginTop: 8 },

  weekRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    gap: 3,
  },
  dayToday: { backgroundColor: Colors.brandDeep, borderColor: Colors.brandDeep },
  dayName: { fontSize: 11.5, fontWeight: '600', color: Colors.warmGrey },
  dayNum: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  dayTextToday: { color: Colors.white },

  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.blush,
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },
  nextBar: { width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: Colors.brandDeep },
  nextLabel: { fontSize: 12, fontWeight: '600', color: Colors.brandDeep, marginBottom: 3 },
  nextSubject: { fontSize: 16.5, fontWeight: '700', color: Colors.textPrimary },
  nextMeta: { fontSize: 13, color: Colors.warmGrey, marginTop: 3 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 22 },
  card: {
    width: '47.8%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    padding: 14,
  },
  cardIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontSize: 13.5, fontWeight: '700', color: Colors.textPrimary, lineHeight: 18 },
  cardDesc: { fontSize: 11.5, color: Colors.warmGrey, marginTop: 2, lineHeight: 15 },
});
