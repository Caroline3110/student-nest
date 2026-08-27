import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { db, auth } from '../../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

export { getDaysUntil } from './examUtils';
import { getDaysUntil } from './examUtils';


export default function ExamsScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExam, setNewExam] = useState({
    subject: '', date: '', time: '09:00', location: '', hoursNeeded: '15',
  });

  useEffect(() => {
    if (!auth.currentUser) {
      console.log('No user logged in');
      return;
    }

    const examsRef = collection(db, 'users', auth.currentUser.uid, 'exams');
    const q = query(examsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedExams = [];
      snapshot.forEach((doc) => {
        loadedExams.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log('Loaded exams:', loadedExams.length);
      setExams(loadedExams);
    }, (error) => {
      console.error('Error loading exams:', error);
    });

    return unsubscribe;
  }, []);

  const scheduleExamReminder = async (exam) => {
    try {
      const examDate = new Date(exam.date + 'T' + exam.time);
      const reminderDate = new Date(examDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      reminderDate.setHours(18, 0, 0);
      
      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: { 
            title: `${exam.subject} exam tomorrow!`, 
            body: `Exam at ${exam.time}. Get studying!` 
          },
          trigger: { 
            type: 'date',
            date: reminderDate,
          },
        });
        console.log('Exam reminder scheduled');
      }
    } catch (e) { 
      console.error('Notification error:', e); 
    }
  };

  const addExam = async () => {
    if (!newExam.subject.trim() || !newExam.date) {
      Alert.alert('Missing fields', 'Please fill in subject and date'); 
      return;
    }

    try {
      const examsRef = collection(db, 'users', auth.currentUser.uid, 'exams');
      
      const exam = {
        subject: newExam.subject,
        date: newExam.date,
        time: newExam.time,
        location: newExam.location || 'TBA',
        hoursNeeded: parseInt(newExam.hoursNeeded) || 15,
        hoursCompleted: 0,
        createdAt: new Date().toISOString(),
      };

      await addDoc(examsRef, exam);
      await scheduleExamReminder(exam);

      setModalVisible(false);
      setNewExam({ subject: '', date: '', time: '09:00', location: '', hoursNeeded: '15' });
      console.log('Exam added to Firebase');
    } catch (error) {
      console.error('Error adding exam:', error);
      Alert.alert('Error', 'Could not save exam');
    }
  };

  const deleteExam = (id) => {
    Alert.alert('Delete exam', 'Remove this exam?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            const examRef = doc(db, 'users', auth.currentUser.uid, 'exams', id);
            await deleteDoc(examRef);
            console.log('Exam deleted');
          } catch (error) {
            console.error('Error deleting exam:', error);
            Alert.alert('Error', 'Could not delete exam');
          }
        }
      },
    ]);
  };

  const addStudyHours = async (id, hours) => {
    try {
      const exam = exams.find(e => e.id === id);
      const examRef = doc(db, 'users', auth.currentUser.uid, 'exams', id);
      
      const newHours = Math.min(exam.hoursCompleted + hours, exam.hoursNeeded);
      
      await updateDoc(examRef, {
        hoursCompleted: newHours,
      });

      console.log('Study hours updated');
    } catch (error) {
      console.error('Error updating study hours:', error);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  const badgeStyle = (days) => {
    if (days < 0)  return { bg: Colors.backgroundDark, text: Colors.textSecondary };
    if (days <= 3) return { bg: '#FFE5E5', text: '#E74C3C' };
    if (days <= 7) return { bg: '#FFF4E5', text: '#F39C12' };
    return { bg: '#E5F3FF', text: '#4A90E2' };
  };

  const progressColor = (pct) => {
    if (pct >= 100) return '#50C878';
    if (pct >= 50)  return '#F39C12';
    return Colors.textPrimary;
  };

  const sorted = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exams</Text>
        <Text style={styles.headerSubtitle}>{exams.length} scheduled</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exams yet</Text>
            <Text style={styles.emptyText}>Tap + to add an exam</Text>
          </View>
        ) : sorted.map((exam) => {
          const days = getDaysUntil(exam.date);
          const pct = Math.round((exam.hoursCompleted / exam.hoursNeeded) * 100);
          const badge = badgeStyle(days);
          const remaining = exam.hoursNeeded - exam.hoursCompleted;

          return (
            <View key={exam.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.examInfo}>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <Text style={styles.examDateTime}>{formatDate(exam.date)} · {exam.time}</Text>
                  <Text style={styles.examLocation}>{exam.location}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  {days < 0 ? (
                    <Text style={[styles.badgeText, { color: badge.text }]}>Past</Text>
                  ) : days === 0 ? (
                    <Text style={[styles.badgeText, { color: badge.text }]}>Today</Text>
                  ) : (
                    <>
                      <Text style={[styles.badgeNum, { color: badge.text }]}>{days}</Text>
                      <Text style={[styles.badgeSub, { color: badge.text }]}>days</Text>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Study progress</Text>
                  <Text style={styles.progressStats}>{exam.hoursCompleted}/{exam.hoursNeeded}h · {pct}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: progressColor(pct) }]} />
                </View>
                {remaining > 0 && days > 0 && (
                  <Text style={styles.rateHint}>{Math.ceil(remaining / days)}h/day to finish on time</Text>
                )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.hoursBtn} onPress={() => addStudyHours(exam.id, 1)}>
                  <Text style={styles.hoursBtnText}>+ 1h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.hoursBtn} onPress={() => addStudyHours(exam.id, 2)}>
                  <Text style={styles.hoursBtnText}>+ 2h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteExam(exam.id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={{ justifyContent: 'flex-end' }}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add exam</Text>
              {[
                { label: 'Subject *', key: 'subject', placeholder: 'e.g. Operating Systems' },
                { label: 'Date *', key: 'date', placeholder: 'YYYY-MM-DD' },
                { label: 'Time', key: 'time', placeholder: '09:00' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Main Hall A' },
                { label: 'Study hours needed', key: 'hoursNeeded', placeholder: '15', keyboard: 'number-pad' },
              ].map(f => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={newExam[f.key]}
                    onChangeText={t => setNewExam({ ...newExam, [f.key]: t })}
                    keyboardType={f.keyboard || 'default'}
                  />
                </View>
              ))}
              <View style={styles.sheetBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={addExam}>
                  <Text style={styles.confirmText}>Add exam</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  scrollContent: { padding: 16 },
  emptyState: { alignItems: 'center', paddingTop: 72 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 13, color: Colors.textLight },
  card: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  examInfo: { flex: 1 },
  examSubject: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, letterSpacing: -0.2, marginBottom: 3 },
  examDateTime: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  examLocation: { fontSize: 12, color: Colors.textMuted },
  badge: { borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, alignItems: 'center', minWidth: 56, marginLeft: 10 },
  badgeNum: { fontSize: 20, fontWeight: '700', lineHeight: 24 },
  badgeSub: { fontSize: 10, fontWeight: '500', marginTop: 1 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 14 },
  progressSection: { marginBottom: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  progressStats: { fontSize: 12, color: Colors.textMuted },
  track: { height: 5, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', borderRadius: 3 },
  rateHint: { fontSize: 11, color: Colors.textMuted },
  actionRow: { flexDirection: 'row', gap: 8 },
  hoursBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 8,
    backgroundColor: '#E5F3FF', alignItems: 'center',
  },
  hoursBtnText: { fontSize: 13, fontWeight: '600', color: '#4A90E2' },
  deleteBtn: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  deleteBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  fabText: { fontSize: 26, color: Colors.white, fontWeight: '300', lineHeight: 30 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 18,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 18 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontWeight: '600', color: Colors.textMuted,
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7,
  },
  input: {
    backgroundColor: Colors.background, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 14, color: Colors.textPrimary,
  },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '600', color: Colors.white },
});