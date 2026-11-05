import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { classTint } from '../../constants/classTints';
import { useLanguage } from '../../i18n';
import { db, auth } from '../../firebase';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import Icon from '../../components/Icon';
import ScreenHeader from '../../components/ScreenHeader';
import PressableScale from '../../components/PressableScale';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOUR_HEIGHT = 62;
const DEFAULT_START = 9;
const DEFAULT_END = 17;

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : 0;
};

// Monday to Friday of this week; the weekend looks ahead to the next one.
const weekDays = (today) => {
  const start = new Date(today);
  const weekday = start.getDay();
  start.setDate(start.getDate() + (weekday === 0 ? 1 : weekday === 6 ? 2 : 1 - weekday));
  return WEEKDAYS.map((name, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { name, date };
  });
};

// Classes that overlap sit side by side: each one takes the first free lane.
const withLanes = (classes) => {
  const sorted = [...classes].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const laneEnds = [];
  const placed = sorted.map(cls => {
    const start = toMinutes(cls.startTime);
    let lane = laneEnds.findIndex(end => end <= start);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = Math.max(toMinutes(cls.endTime), start + 30);
    return { cls, lane };
  });
  return { placed, lanes: Math.max(laneEnds.length, 1) };
};

export default function StudyDashboardScreen({ navigation, route }) {
  const { t, lang } = useLanguage();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('timetable');
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);

  // Opened from a day on the Home week strip, otherwise today.
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const requestedDay = route?.params?.day;
  const [selectedDay, setSelectedDay] = useState(
    WEEKDAYS.includes(requestedDay) ? requestedDay
      : WEEKDAYS.includes(todayName) ? todayName : 'Monday'
  );
  useEffect(() => {
    if (WEEKDAYS.includes(requestedDay)) setSelectedDay(requestedDay);
  }, [requestedDay]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const listen = (name, setter) => onSnapshot(
      collection(db, 'users', uid, name),
      snap => setter(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error(`Error loading ${name}:`, err),
    );
    const unsubs = [
      listen('timetable', setClasses),
      listen('tasks', setTasks),
      listen('exams', setExams),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const dayClasses = classes.filter(c => c.day === selectedDay);
  const { placed, lanes } = withLanes(dayClasses);

  // The grid covers the working day, stretched to fit anything outside it.
  const starts = dayClasses.map(c => Math.floor(toMinutes(c.startTime) / 60));
  const ends = dayClasses.map(c => Math.ceil(toMinutes(c.endTime) / 60));
  const gridStart = Math.min(DEFAULT_START, ...starts);
  const gridEnd = Math.max(DEFAULT_END, ...ends);
  const hours = Array.from({ length: gridEnd - gridStart + 1 }, (_, i) => gridStart + i);

  const toggleTask = async (task) => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', task.id), {
        completed: !task.completed,
      });
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-GB', { month: 'short', day: 'numeric' });
  const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  const activeTasks = tasks.filter(task => !task.completed);
  const doneTasks = tasks.filter(task => task.completed);
  const sortedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  const TABS = [
    { key: 'timetable', label: t('study.timetable') },
    { key: 'tasks', label: t('study.todo') },
    { key: 'exams', label: t('study.exams') },
  ];

  const addButton = (label, screen) => (
    <PressableScale style={styles.addBtn} onPress={() => navigation.navigate(screen)}>
      <Icon name="plus" size={18} color={Colors.white} />
      <Text style={styles.addBtnText}>{label}</Text>
    </PressableScale>
  );

  return (
    <View style={styles.root}>
      <ScreenHeader
        navigation={navigation}
        title={t('study.title')}
        actions={[{
          icon: 'clock',
          label: t('study.focus'),
          onPress: () => navigation.navigate('Pomodoro'),
        }]}
      />

      <View style={styles.segment}>
        {TABS.map(item => (
          <Pressable
            key={item.key}
            style={[styles.segmentBtn, tab === item.key && styles.segmentBtnActive]}
            onPress={() => setTab(item.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === item.key }}
          >
            <Text style={[styles.segmentText, tab === item.key && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'timetable' && (
          <>
            <View style={styles.weekRow}>
              {weekDays(new Date()).map(({ name, date }) => {
                const active = name === selectedDay;
                return (
                  <Pressable
                    key={name}
                    style={[styles.day, active && styles.dayActive]}
                    onPress={() => setSelectedDay(name)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.dayName, active && styles.dayTextActive]}>
                      {t(`daysShort.${name}`)}
                    </Text>
                    <Text style={[styles.dayNum, active && styles.dayTextActive]}>
                      {date.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {dayClasses.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Icon name="calendar" size={26} color={Colors.brandDeep} />
                </View>
                <Text style={styles.emptyTitle}>{t('timetable.noClassesDay')}</Text>
                <Text style={styles.emptySub}>{t('planner.noClassesSub')}</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                <View style={styles.gridInner}>
                  <View>
                    {hours.map(hour => (
                      <View key={hour} style={styles.hourRow}>
                        <Text style={styles.hourLabel}>{String(hour).padStart(2, '0')}:00</Text>
                        <View style={styles.hourLine} />
                      </View>
                    ))}
                  </View>

                  <View style={styles.blockLayer}>
                  {placed.map(({ cls, lane }) => {
                    const top = ((toMinutes(cls.startTime) - gridStart * 60) / 60) * HOUR_HEIGHT;
                    const height = Math.max(
                      ((toMinutes(cls.endTime) - toMinutes(cls.startTime)) / 60) * HOUR_HEIGHT - 5,
                      42,
                    );
                    const tint = classTint(cls);
                    const laneWidth = 100 / lanes;
                    return (
                      <View
                        key={cls.id}
                        style={[styles.block, {
                          top,
                          height,
                          backgroundColor: tint.bg,
                          left: `${lane * laneWidth}%`,
                          width: `${laneWidth}%`,
                        }]}
                      >
                        <Text style={[styles.blockSubject, { color: tint.text }]} numberOfLines={2}>
                          {cls.subject}
                        </Text>
                        {cls.location && cls.location !== 'TBA' ? (
                          <Text style={[styles.blockMeta, { color: tint.text }]} numberOfLines={1}>
                            {cls.location}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                  </View>
                </View>
              </View>
            )}

            {addButton(t('timetable.addClass'), 'Timetable')}
          </>
        )}

        {tab === 'tasks' && (
          <>
            {tasks.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Icon name="check-circle" size={26} color={Colors.brandDeep} />
                </View>
                <Text style={styles.emptyTitle}>{t('todo.emptyTitle')}</Text>
                <Text style={styles.emptySub}>{t('planner.noTasksSub')}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.listLabel}>
                  {t('todo.summary', { active: activeTasks.length, done: doneTasks.length })}
                </Text>
                {[...activeTasks, ...doneTasks].map(task => (
                  <Pressable
                    key={task.id}
                    style={styles.taskRow}
                    onPress={() => toggleTask(task)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: !!task.completed }}
                  >
                    <View style={[styles.checkbox, task.completed && styles.checkboxOn]}>
                      {task.completed ? <Icon name="check" size={13} color={Colors.white} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskDone]} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        {t(`study.categories.${task.category}`)} · {t(`study.priorities.${task.priority}`)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
            {addButton(t('todo.addTask'), 'Todo')}
          </>
        )}

        {tab === 'exams' && (
          <>
            {sortedExams.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Icon name="award" size={26} color={Colors.brandDeep} />
                </View>
                <Text style={styles.emptyTitle}>{t('planner.noExamsTitle')}</Text>
                <Text style={styles.emptySub}>{t('planner.noExamsSub')}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.listLabel}>{t('exams.scheduled', { count: sortedExams.length })}</Text>
                {sortedExams.map(exam => {
                  const days = daysUntil(exam.date);
                  const pct = Math.min(
                    Math.round(((exam.hoursCompleted || 0) / (exam.hoursNeeded || 1)) * 100), 100,
                  );
                  return (
                    <Pressable
                      key={exam.id}
                      style={styles.examCard}
                      onPress={() => navigation.navigate('Exams')}
                    >
                      <View style={styles.examTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.examSubject} numberOfLines={1}>{exam.subject}</Text>
                          <Text style={styles.examDate}>{formatDate(exam.date)} · {exam.time}</Text>
                        </View>
                        <View style={[styles.daysBadge, days <= 3 && styles.daysBadgeUrgent]}>
                          <Text style={[styles.daysText, days <= 3 && styles.daysTextUrgent]}>
                            {days < 0 ? t('exams.past') : days === 0 ? t('exams.today') : t('study.daysShort', { count: days })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.track}>
                        <View style={[styles.fill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.examProgress}>
                        {t('study.hoursStudied', { done: exam.hoursCompleted || 0, total: exam.hoursNeeded })}
                      </Text>
                    </Pressable>
                  );
                })}
              </>
            )}
            {addButton(t('planner.addExam'), 'Exams')}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  segment: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 16,
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

  weekRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
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
  dayActive: { backgroundColor: Colors.brandDeep, borderColor: Colors.brandDeep },
  dayName: { fontSize: 11.5, fontWeight: '600', color: Colors.warmGrey },
  dayNum: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  dayTextActive: { color: Colors.white },

  grid: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 18,
    padding: 14,
    paddingRight: 16,
  },
  hourRow: { flexDirection: 'row', alignItems: 'flex-start', height: HOUR_HEIGHT, gap: 10 },
  hourLabel: { width: 42, fontSize: 11.5, color: Colors.warmMuted, fontWeight: '600', marginTop: -6 },
  hourLine: { flex: 1, height: 1, backgroundColor: Colors.creamBorder },
  // An unpadded box so the absolute blocks line up with the hour rows.
  gridInner: { position: 'relative' },
  // The blocks float over the hour lines, starting past the time column
  // (label width 42 + the row gap of 10).
  blockLayer: { position: 'absolute', left: 52, right: 0, top: 0 },
  block: {
    position: 'absolute',
    borderRadius: 11,
    padding: 10,
    paddingRight: 8,
    overflow: 'hidden',
  },
  blockSubject: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  blockMeta: { fontSize: 11.5, marginTop: 2, opacity: 0.85 },

  listLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warmMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 9,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.creamBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: Colors.brandDeep, borderColor: Colors.brandDeep },
  taskTitle: { fontSize: 14.5, fontWeight: '600', color: Colors.textPrimary },
  taskDone: { textDecorationLine: 'line-through', color: Colors.warmMuted },
  taskMeta: { fontSize: 12, color: Colors.warmMuted, marginTop: 3 },

  examCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.creamBorder,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },
  examTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  examSubject: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  examDate: { fontSize: 12.5, color: Colors.warmGrey, marginTop: 3 },
  daysBadge: { backgroundColor: Colors.blush, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 5 },
  daysBadgeUrgent: { backgroundColor: Colors.errorLight },
  daysText: { fontSize: 12, fontWeight: '700', color: Colors.brandDeep },
  daysTextUrgent: { color: Colors.error },
  track: { height: 6, backgroundColor: Colors.surfaceMuted, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.brandDeep, borderRadius: 3 },
  examProgress: { fontSize: 11.5, color: Colors.warmMuted, marginTop: 7 },

  empty: { alignItems: 'center', paddingVertical: 44 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  emptySub: { fontSize: 13.5, color: Colors.warmGrey, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brandDeep,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 18,
  },
  addBtnText: { fontSize: 15.5, fontWeight: '700', color: Colors.white },
});
