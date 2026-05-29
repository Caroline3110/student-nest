import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { db, auth } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const WEEKLY_GOAL = 30;

export default function StudyDashboardScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const tasksRef = collection(db, 'users', uid, 'tasks');
    const unsubTasks = onSnapshot(query(tasksRef), (snap) => {
      const loaded = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() }));
      setTasks(loaded);
    });

    const examsRef = collection(db, 'users', uid, 'exams');
    const unsubExams = onSnapshot(query(examsRef), (snap) => {
      const loaded = [];
      snap.forEach(d => loaded.push({ id: d.id, ...d.data() }));
      setExams(loaded);
    });

    return () => { unsubTasks(); unsubExams(); };
  }, []);

  const todaysTasks = tasks.filter(t => !t.completed).slice(0, 3);

  const upcomingExams = exams
    .filter(e => {
      const d = new Date(e.date); const now = new Date();
      const in30 = new Date(); in30.setDate(now.getDate() + 30);
      return d >= now && d <= in30;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const studiedHours = exams.reduce((sum, e) => sum + (e.hoursCompleted || 0), 0);
  const weekPct = Math.min(Math.round((studiedHours / WEEKLY_GOAL) * 100), 100);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const getDaysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  const quickActions = [
    { label: 'Timetable', screen: 'Timetable' },
    { label: 'Exams', screen: 'Exams' },
    { label: 'To-do', screen: 'Todo' },
    { label: 'Focus', screen: 'Pomodoro' },
  ];

  const priorityColor = (p) =>
    p === 'high' ? Colors.error : p === 'medium' ? Colors.warning : Colors.textMuted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study planner</Text>
        <Text style={styles.headerSubtitle}>Track your academic progress</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick access</Text>
        <View style={styles.quickGrid}>
          {quickActions.map(a => (
            <TouchableOpacity
              key={a.screen}
              style={styles.quickCard}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly study hours */}
        <Text style={styles.sectionLabel}>Study progress</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalRow}>
            <View>
              <Text style={styles.goalHours}>
                {studiedHours}
                <Text style={styles.goalTotal}> / {WEEKLY_GOAL}h</Text>
              </Text>
              <Text style={styles.goalSub}>Total study hours logged</Text>
            </View>
            <View style={styles.examsBadge}>
              <Text style={styles.examsNum}>{exams.length}</Text>
              <Text style={styles.examsLabel}>exams</Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${weekPct}%` }]} />
          </View>
          <View style={styles.goalFooter}>
            <Text style={styles.goalPct}>{weekPct}% of goal</Text>
            <Text style={styles.goalLeft}>
              {studiedHours >= WEEKLY_GOAL ? 'Goal reached' : `${WEEKLY_GOAL - studiedHours}h to go`}
            </Text>
          </View>
        </View>

        {/* Today's tasks */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Active tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Todo')}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {todaysTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {tasks.length === 0 ? 'No tasks yet — add one in To-do' : 'All tasks complete!'}
            </Text>
          </View>
        ) : todaysTasks.map(task => (
          <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => navigation.navigate('Todo')} activeOpacity={0.8}>
            <View style={styles.checkbox} />
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskMeta}>{task.category} · {task.priority} priority</Text>
            </View>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor(task.priority) }]} />
          </TouchableOpacity>
        ))}

        {/* Upcoming exams */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Upcoming exams</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Exams')}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {upcomingExams.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {exams.length === 0 ? 'No exams yet — add one in Exams' : 'No exams in the next 30 days'}
            </Text>
          </View>
        ) : upcomingExams.map(exam => {
          const days = getDaysUntil(exam.date);
          const pct = Math.round(((exam.hoursCompleted || 0) / (exam.hoursNeeded || 1)) * 100);
          return (
            <TouchableOpacity key={exam.id} style={styles.examCard} onPress={() => navigation.navigate('Exams')} activeOpacity={0.8}>
              <View style={styles.examRow}>
                <View style={styles.examInfo}>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <Text style={styles.examDate}>{formatDate(exam.date)} · {exam.time}</Text>
                </View>
                <View style={[styles.daysBadge, days <= 3 && styles.daysBadgeUrgent]}>
                  <Text style={[styles.daysText, days <= 3 && styles.daysTextUrgent]}>{days}d</Text>
                </View>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: Colors.success }]} />
              </View>
              <Text style={styles.examProgress}>{exam.hoursCompleted || 0}/{exam.hoursNeeded}h studied</Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface, paddingHorizontal: 20,
    paddingTop: 12, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, fontWeight: '500', color: Colors.textLight },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4, marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: Colors.textLight },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewAll: { fontSize: 13, fontWeight: '500', color: Colors.primary },
  quickGrid: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  quickCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  goalCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 24,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  goalHours: { fontSize: 30, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.8 },
  goalTotal: { fontSize: 18, fontWeight: '400', color: Colors.textSecondary },
  goalSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  examsBadge: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center',
  },
  examsNum: { fontSize: 22, fontWeight: '700', color: Colors.primary, lineHeight: 26 },
  examsLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  track: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalPct: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  goalLeft: { fontSize: 12, color: Colors.textMuted },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginBottom: 8,
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: Colors.border, marginRight: 12,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 2 },
  taskMeta: { fontSize: 12, color: Colors.textMuted },
  priorityDot: { width: 7, height: 7, borderRadius: 4, marginLeft: 10 },
  examCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, marginBottom: 8,
  },
  examRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  examInfo: { flex: 1 },
  examSubject: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary, marginBottom: 3 },
  examDate: { fontSize: 12, color: Colors.textMuted },
  daysBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  daysBadgeUrgent: { backgroundColor: Colors.errorLight },
  daysText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  daysTextUrgent: { color: Colors.error },
  examProgress: { fontSize: 11, color: Colors.textMuted, marginTop: 6 },
  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, alignItems: 'center', marginBottom: 24,
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },
});
